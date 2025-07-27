using InterviewPrep.API.Application.DTOs.Admin;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public interface IUserAdminDashboardRepository
    {
        Task<UserAdminDashboardStatsDto> GetUserAdminDashboardStatsAsync();
        Task<int> GetTotalAccountsAsync();
        Task<int> GetTotalCustomersAsync();
        Task<int> GetTotalStaffAsync();
        Task<int> GetActiveAccountsAsync();
        Task<int> GetInactiveAccountsAsync();
        Task<int> GetPremiumCustomersAsync();
        Task<int> GetFreeCustomersAsync();
    }
}
