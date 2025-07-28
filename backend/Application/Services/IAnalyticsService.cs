using InterviewPrep.API.Application.DTOs.Business;

namespace InterviewPrep.API.Application.Services
{
    public interface IAnalyticsService
    {
        Task<UserEngagementDto> GetUserEngagementMetricsAsync(DateTime? startDate, DateTime? endDate);
        Task<IEnumerable<StaffPerformanceDto>> GetStaffPerformanceAsync(DateTime? startDate, DateTime? endDate, string? staffId);

    }
}
