using InterviewPrep.API.Application.DTOs.Staff;
using InterviewPrep.API.Data.Repositories;

namespace InterviewPrep.API.Application.Services
{
    public class AdminDashboardService : IAdminDashboardService
    {
        private readonly IAdminDashboardRepository _repository;

        public AdminDashboardService(IAdminDashboardRepository repo)
        {
            _repository = repo;
        }

        public async Task<SystemStatsDto> GetSystemStatsAsync(int monthsBack)
        {
            var stats = new SystemStatsDto
            {
                TotalUsers = await _repository.GetTotalUsersAsync(),
                TotalSessions = await _repository.GetTotalSessionsAsync(),
                TotalRevenue = await _repository.GetTotalRevenueAsync(),
                RevenueByMonth = await _repository.GetRevenuePerMonthAsync(monthsBack),
               
            };

            return stats;
        }
    }

}
