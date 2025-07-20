using InterviewPrep.API.Application.DTOs.Staff;

namespace InterviewPrep.API.Data.Repositories
{
    public interface IAdminDashboardRepository
    {
        Task<int> GetTotalUsersAsync();
        Task<int> GetTotalSessionsAsync();
        Task<decimal> GetTotalRevenueAsync();
        Task<List<MonthlyRevenue>> GetRevenuePerMonthAsync(int monthsBack);
      
    }

}
