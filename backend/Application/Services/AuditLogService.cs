using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Application.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor; 

        public AuditLogService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
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
