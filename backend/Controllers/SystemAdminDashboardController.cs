using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Application.DTOs.SystemAdmin;
using System.Threading.Tasks;

namespace InterviewPrep.API.Controllers
{
    [Route("api/systemadmin/dashboard")]
    [ApiController]
    //[Authorize(Roles = "SystemAdmin")]
    public class SystemAdminDashboardController : ControllerBase
    {
        private readonly ISystemAdminDashboardService _dashboardService;

        public SystemAdminDashboardController(ISystemAdminDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<SystemAdminDashboardStatsDto>> GetDashboardStats()
        {
            try
            {
                var stats = await _dashboardService.GetDashboardStatsAsync();
                return Ok(stats);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching dashboard statistics.", error = ex.Message });
            }
        }
    }
} 