using InterviewPrep.API.Application.DTOs.SystemAdmin;
using System.Threading.Tasks;

namespace InterviewPrep.API.Application.Services
{
    public interface ISystemAdminDashboardService
    {
        Task<SystemAdminDashboardStatsDto> GetDashboardStatsAsync();
    }
} 