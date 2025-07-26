using InterviewPrep.API.Application.DTOs.Staff;

namespace InterviewPrep.API.Application.Services
{
    public interface IAdminDashboardService
    {
        Task<SystemStatsDto> GetSystemStatsAsync(int monthsBack);
    }
}
