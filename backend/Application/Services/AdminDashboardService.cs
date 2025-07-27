using InterviewPrep.API.Application.DTOs.Admin;
using InterviewPrep.API.Data.Repositories;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace InterviewPrep.API.Application.Services
{
    public class UserAdminDashboardService : IUserAdminDashboardService
    {
        private readonly IUserAdminDashboardRepository _dashboardRepository;
        private readonly IAuditLogService _auditLogService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserAdminDashboardService(
            IUserAdminDashboardRepository dashboardRepository,
            IAuditLogService auditLogService,
            IHttpContextAccessor httpContextAccessor)
        {
            _dashboardRepository = dashboardRepository;
            _auditLogService = auditLogService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<UserAdminDashboardStatsDto> GetDashboardStatsAsync()
        {
            var stats = await _dashboardRepository.GetUserAdminDashboardStatsAsync();

            // Log the action for audit
            var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
            await _auditLogService.LogActionAsync(
                _httpContextAccessor.HttpContext?.User?.Identity?.Name ?? "System",
                "Accessed UserAdmin dashboard statistics",
                ip
            );

            return stats;
        }
    }
} 