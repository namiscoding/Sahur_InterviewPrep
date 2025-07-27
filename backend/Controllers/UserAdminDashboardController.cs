using InterviewPrep.API.Application.DTOs.Admin;
using InterviewPrep.API.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrep.API.Controllers
{
    [Route("api/useradmin")]
    [ApiController]
    //[Authorize(Roles = "UserAdmin")]
    public class UserAdminDashboardController : ControllerBase
    {
        private readonly IUserAdminDashboardService _dashboardService;

        public UserAdminDashboardController(IUserAdminDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("dashboard/stats")]
        public async Task<ActionResult<UserAdminDashboardStatsDto>> GetDashboardStats()
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