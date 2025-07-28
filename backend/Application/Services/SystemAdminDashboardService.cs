using InterviewPrep.API.Application.DTOs.SystemAdmin;
using InterviewPrep.API.Data.Repositories;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace InterviewPrep.API.Application.Services
{
    public class SystemAdminDashboardService : ISystemAdminDashboardService
    {
        private readonly ISystemAdminDashboardRepository _dashboardRepository;
        private readonly IAuditLogService _auditLogService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SystemAdminDashboardService(
            ISystemAdminDashboardRepository dashboardRepository,
            IAuditLogService auditLogService,
            IHttpContextAccessor httpContextAccessor)
        {
            _dashboardRepository = dashboardRepository;
            _auditLogService = auditLogService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<SystemAdminDashboardStatsDto> GetDashboardStatsAsync()
        {
            var stats = await _dashboardRepository.GetSystemAdminDashboardStatsAsync();

            return stats;
        }
    }
} 