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
    public class SeedUserInfo
    {
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }

    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly SeedAccountHelper _seedAccountHelper;
        
        public AuditLogService(IAuditLogRepository auditLogRepository, IMapper mapper, ApplicationDbContext context, IHttpContextAccessor httpContextAccessor, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, SeedAccountHelper seedAccountHelper)
        {
            _auditLogRepository = auditLogRepository;
            _mapper = mapper;
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _userManager = userManager;
            _roleManager = roleManager;
            _seedAccountHelper = seedAccountHelper;
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

            // Tạo mapping cho các seed users (hardcode)
            var seedUserMap = await GetSeedUserMappingAsync();
            
            // Lấy thông tin User (DisplayName) và Role một lần để tối ưu
            var userMap = new Dictionary<string, ApplicationUser>();
            var roleMap = new Dictionary<string, string>(); // userId -> roleName

            if (rawLogs.Any())
            {
                var distinctUserIds = rawLogs.Where(al => al.UserId != null).Select(al => al.UserId!).Distinct().ToList();
                foreach (var distinctId in distinctUserIds)
                {
                    // Kiểm tra trong seed users trước
                    if (seedUserMap.ContainsKey(distinctId))
                    {
                        var seedUser = seedUserMap[distinctId];
                        userMap[distinctId] = new ApplicationUser 
                        { 
                            Id = distinctId, 
                            DisplayName = seedUser.DisplayName,
                            Email = seedUser.Email,
                            UserName = seedUser.Email
                        };
                        roleMap[distinctId] = seedUser.Role;
                    }
                    else
                    {
                        // Fallback về database cho users khác
                        var user = await _userManager.FindByIdAsync(distinctId);
                        if (user != null)
                        {
                            userMap[distinctId] = user;
                            var roles = await _userManager.GetRolesAsync(user);
                            roleMap[distinctId] = roles.FirstOrDefault() ?? "No Role";
                        }
                        // Nếu không tìm thấy user, bỏ qua (không thêm vào map)
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

        private async Task<Dictionary<string, SeedUserInfo>> GetSeedUserMappingAsync()
        {
            var seedUserMap = new Dictionary<string, SeedUserInfo>();
            
            // Danh sách email của các seed accounts
            var seedEmails = new[] { "useradmin@gmail.com", "systemadmin@gmail.com", "businessadmin@gmail.com" };

            foreach (var email in seedEmails)
            {
                var seedAccountInfo = await _seedAccountHelper.GetSeedAccountInfoAsync(email);
                if (seedAccountInfo != null && !string.IsNullOrEmpty(seedAccountInfo.UserId))
                {
                    seedUserMap[seedAccountInfo.UserId] = new SeedUserInfo 
                    { 
                        DisplayName = seedAccountInfo.DisplayName, 
                        Email = seedAccountInfo.Email, 
                        Role = seedAccountInfo.Role 
                    };
                }
            }

            return seedUserMap;
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

            // Parse Action Type
            if (action.StartsWith("Created ")) actionType = "Created";
            else if (action.StartsWith("Updated ")) actionType = "Updated";
            else if (action.StartsWith("Deleted ")) actionType = "Deleted";
            else if (action.StartsWith("Activated ")) actionType = "Activated";
            else if (action.StartsWith("Inactivated ")) actionType = "Inactivated";
            else if (action.StartsWith("Reset password")) actionType = "Reset Password";
            else if (action.StartsWith("Batch Inactivated ")) actionType = "Batch Inactivated";
            else if (action.StartsWith("Batch Activated ")) actionType = "Batch Activated";
            else if (action.StartsWith("Viewed ")) actionType = "Viewed";
            else if (action.StartsWith("Accessed ")) actionType = "Accessed";
            else if (action.StartsWith("Logged In")) actionType = "Logged In";
            else if (action.StartsWith("Logged Out")) actionType = "Logged Out";

            // Parse Area - cập nhật để match với các action logs mới và cũ
            if (action.Contains("customer status") || action.Contains("customer subscription") || action.Contains("customer transactions"))
                area = "Customer";
            else if (action.Contains("staff status") || action.Contains("staff account") || action.Contains("for staff:"))
                area = "Staff";
            else if (action.Contains("user admin status") || action.Contains("UserAdmin status") || action.Contains("UserAdmin account") || action.Contains("for UserAdmin:"))
                area = "UserAdmin";
            else if (action.Contains("Category:") || action.Contains("Category"))
                area = "Category";
            else if (action.Contains("Question:") || action.Contains("Question"))
                area = "Question";
            else if (action.Contains("Subscription Plan"))
                area = "Subscription";
            else if (action.Contains("System Setting") || action.Contains("SystemAdmin dashboard") || action.Contains("UserAdmin dashboard"))
                area = "System";
            else if (action.Contains("transaction") || action.Contains("Transaction"))
                area = "Transaction";
        }
    }
}