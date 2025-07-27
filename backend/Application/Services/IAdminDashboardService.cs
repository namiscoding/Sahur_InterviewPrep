using InterviewPrep.API.Application.DTOs.Admin;
using System.Threading.Tasks;

namespace InterviewPrep.API.Application.Services
{
    public interface IUserAdminDashboardService
    {
        Task<UserAdminDashboardStatsDto> GetDashboardStatsAsync();
    }
}
