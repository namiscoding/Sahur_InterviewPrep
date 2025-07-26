using AutoMapper;
using InterviewPrep.API.Application.DTOs.Audit;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Repositories;
using Microsoft.AspNetCore.Http; // Import IHttpContextAccessor
using Microsoft.AspNetCore.Identity;
using System; // Import DateTime
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPrep.API.Application.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        public AuditLogService(IAuditLogRepository auditLogRepository, IMapper mapper, ApplicationDbContext context, IHttpContextAccessor httpContextAccessor, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _auditLogRepository = auditLogRepository;
            _mapper = mapper;
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<PagedResult<AuditLogDTO>> GetAllAuditLogsAsync(string userId = null, string action = null, DateTime? from = null, DateTime? to = null, int page = 1, int pageSize = 50)
        {
            var (logs, total) = await _auditLogRepository.GetAllAuditLogsAsync(userId, action, from, to, page, pageSize);
            var dtos = _mapper.Map<IEnumerable<AuditLogDTO>>(logs);

            // Populate UserEmail
            foreach (var dto in dtos)
            {
                if (!string.IsNullOrEmpty(dto.UserId))
                {
                    var user = await _context.Users.FindAsync(dto.UserId);
                    dto.UserEmail = user?.Email;
                }
            }

            return new PagedResult<AuditLogDTO>
            {
                Data = dtos,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task LogActionAsync(string userId, string action, string? ipAddress = null)
        {
            DateTime utcNow = DateTime.UtcNow;
            TimeZoneInfo vietnamTimeZone;
            try
            {
                vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            }
            catch (TimeZoneNotFoundException)
            {
                vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
            }
            DateTime vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(utcNow, vietnamTimeZone);

            var auditLog = new AuditLog
            {
                UserId = userId,
                Action = action,
                IpAddress = ipAddress ?? _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString(),
                CreatedAt = vietnamTime
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
        }

        public async Task LogCategoryActionAsync(string userId, string actionType, int categoryId, string? categoryName, string? ipAddress)
        {
            string actionDescription = $"{actionType} Category: ID={categoryId}";
            if (!string.IsNullOrEmpty(categoryName))
            {
                actionDescription += $", Name='{categoryName}'";
            }
            await LogActionAsync(userId, actionDescription, ipAddress);
        }

        public async Task LogQuestionActionAsync(string userId, string actionType, long questionId, string? questionContent, string? ipAddress)
        {
            string actionDescription = $"{actionType} Question: ID={questionId}";
            if (!string.IsNullOrEmpty(questionContent))
            {
                // Chỉ lấy một phần nội dung nếu quá dài để tránh log quá lớn
                actionDescription += $", Content='{(questionContent.Length > 100 ? questionContent.Substring(0, 100) + "..." : questionContent)}'";
            }
            await LogActionAsync(userId, actionDescription, ipAddress);
        }

        public async Task<IEnumerable<SAAuditLogDTO>> GetFilteredAndParsedAuditLogsAsync(
            string? userId,
            string? userName,
            string? userRole,
            string? area,
            string? actionType,
            DateTime? startDate,
            DateTime? endDate)
        {
            var rawLogs = await _auditLogRepository.GetFilteredAuditLogsAsync(userId, userName, userRole, startDate, endDate);

            var auditLogDTOs = new List<SAAuditLogDTO>(); // THAY ĐỔI KIỂU DTO Ở ĐÂY

            // Lấy thông tin User (DisplayName) và Role một lần để tối ưu
            var userMap = new Dictionary<string, ApplicationUser>();
            var roleMap = new Dictionary<string, string>(); // userId -> roleName

            if (rawLogs.Any())
            {
                var distinctUserIds = rawLogs.Where(al => al.UserId != null).Select(al => al.UserId!).Distinct().ToList();
                foreach (var distinctId in distinctUserIds)
                {
                    var user = await _userManager.FindByIdAsync(distinctId);
                    if (user != null)
                    {
                        userMap[distinctId] = user;
                        var roles = await _userManager.GetRolesAsync(user);
                        roleMap[distinctId] = roles.FirstOrDefault() ?? "No Role";
                    }
                }
            }

            // Thực hiện phân tích chuỗi Action và áp dụng lọc Area/ActionType
            foreach (var log in rawLogs)
            {
                string parsedArea;
                string parsedActionType;
                ParseAuditActionString(log.Action, out parsedArea, out parsedActionType);

                // Áp dụng bộ lọc Area (nếu có)
                if (!string.IsNullOrEmpty(area) && !parsedArea.Equals(area, StringComparison.OrdinalIgnoreCase) && area != "all")
                {
                    continue;
                }

                // Áp dụng bộ lọc ActionType (nếu có)
                if (!string.IsNullOrEmpty(actionType) && !parsedActionType.Equals(actionType, StringComparison.OrdinalIgnoreCase) && actionType != "all")
                {
                    continue;
                }

                // Map sang DTO mới và thêm vào danh sách
                auditLogDTOs.Add(new SAAuditLogDTO // THAY ĐỔI KIỂU DTO Ở ĐÂY
                {
                    Id = log.Id,
                    UserId = log.UserId,
                    UserName = userMap.TryGetValue(log.UserId ?? "", out var user) ? user.DisplayName : null,
                    UserRole = roleMap.TryGetValue(log.UserId ?? "", out var roleName) ? roleName : null,
                    ActionDescription = log.Action,
                    Area = parsedArea,
                    ActionType = parsedActionType,
                    IpAddress = log.IpAddress,
                    CreatedAt = log.CreatedAt
                });
            }

            return auditLogDTOs;
        }

        private DateTime GetVietnamTime()
        {
            DateTime utcNow = DateTime.UtcNow;
            TimeZoneInfo vietnamTimeZone;
            try
            {
                vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            }
            catch (TimeZoneNotFoundException)
            {
                vietnamTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
            }
            return TimeZoneInfo.ConvertTimeFromUtc(utcNow, vietnamTimeZone);
        }

        private void ParseAuditActionString(string action, out string area, out string actionType)
        {
            area = "Unknown";
            actionType = "Unknown";

            if (string.IsNullOrEmpty(action)) return;

            if (action.StartsWith("Added ")) actionType = "Added";
            else if (action.StartsWith("Updated ")) actionType = "Updated";
            else if (action.StartsWith("Deleted ")) actionType = "Deleted";
            else if (action.StartsWith("Activated ")) actionType = "Activated";
            else if (action.StartsWith("Inactivated ")) actionType = "Inactivated";
            else if (action.StartsWith("Batch Inactivated ")) actionType = "Batch Inactivated";
            else if (action.StartsWith("Batch Activated ")) actionType = "Batch Activated";
            else if (action.StartsWith("Logged In")) actionType = "Logged In";
            else if (action.StartsWith("Logged Out")) actionType = "Logged Out";

            if (action.Contains("Category")) area = "Category";
            else if (action.Contains("Question")) area = "Question";
            else if (action.Contains("Subscription Plan")) area = "Subscription Plan";
            else if (action.Contains("User ")) area = "User";
        }
    }
}