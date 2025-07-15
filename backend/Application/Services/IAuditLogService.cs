using InterviewPrep.API.Application.DTOs.Audit;
using System.Threading.Tasks;
using System; // Required for DateTime

namespace InterviewPrep.API.Application.Services
{
    public interface IAuditLogService
    {
        Task<PagedResult<AuditLogDTO>> GetAllAuditLogsAsync(string userId = null, string action = null, DateTime? from = null, DateTime? to = null, int page = 1, int pageSize = 50);
        Task LogActionAsync(string userId, string action, string? ipAddress = null);
        Task LogCategoryActionAsync(string userId, string actionType, int categoryId, string? categoryName, string? ipAddress);
        Task LogQuestionActionAsync(string userId, string actionType, long questionId, string? questionContent, string? ipAddress);
    }
}