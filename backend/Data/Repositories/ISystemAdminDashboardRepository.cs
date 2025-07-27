using InterviewPrep.API.Application.DTOs.SystemAdmin;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public interface ISystemAdminDashboardRepository
    {
        Task<SystemAdminDashboardStatsDto> GetSystemAdminDashboardStatsAsync();
        Task<int> GetTotalTransactionsAsync();
        Task<int> GetCompletedTransactionsAsync();
        Task<int> GetPendingTransactionsAsync();
        Task<int> GetFailedTransactionsAsync();
        Task<decimal> GetTotalRevenueAsync();
        Task<int> GetTotalUserAdminsAsync();
        Task<int> GetActiveUserAdminsAsync();
        Task<int> GetTotalUsageLimitsAsync();
        Task<int> GetSystemSettingsCountAsync();
        Task<int> GetTransactionsTodayAsync();
        Task<decimal> GetRevenueTodayAsync();
        Task<decimal> GetAvgTransactionValueAsync();
        Task<List<RevenueByCurrencyDto>> GetRevenueByCurrencyAsync();
    }
} 