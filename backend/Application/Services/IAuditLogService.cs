using InterviewPrep.API.Application.DTOs.Audit;
using System.Threading.Tasks;
using System; // Required for DateTime

namespace InterviewPrep.API.Application.Services
{
    public interface IAuditLogService
    {
        Task LogActionAsync(string userId, string action, string? ipAddress = null);
        Task LogCategoryActionAsync(string userId, string actionType, int categoryId, string? categoryName, string? ipAddress);
        Task LogQuestionActionAsync(string userId, string actionType, long questionId, string? questionContent, string? ipAddress);
        //Task LogSubscriptionPlanActionAsync(string userId, string actionType, int planId, string? planName, string? ipAddress);

        Task<IEnumerable<SAAuditLogDTO>> GetFilteredAndParsedAuditLogsAsync(
           string? userId,
           string? userName,
           string? userRole,
           string? area,
           string? actionType,
           DateTime? startDate,
           DateTime? endDate);
    }
}