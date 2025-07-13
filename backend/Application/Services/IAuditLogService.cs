namespace InterviewPrep.API.Application.Services
{
    public interface IAuditLogService
    {
        Task LogActionAsync(string userId, string action, string? ipAddress = null);
        Task LogCategoryActionAsync(string userId, string actionType, int categoryId, string? categoryName, string? ipAddress);
        Task LogQuestionActionAsync(string userId, string actionType, long questionId, string? questionContent, string? ipAddress);
    }
}
