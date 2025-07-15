using AutoMapper;
using InterviewPrep.API.Application.DTOs.Audit;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http; // Import IHttpContextAccessor
using System; // Import DateTime

namespace InterviewPrep.API.Application.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditLogService(IAuditLogRepository auditLogRepository, IMapper mapper, ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _auditLogRepository = auditLogRepository;
            _mapper = mapper;
            _context = context;
            _httpContextAccessor = httpContextAccessor;
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
    }
}