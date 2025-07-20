using InterviewPrep.API.Application.DTOs.Staff;
using InterviewPrep.API.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrep.API.Controllers
{
    [Route("api")]
    [ApiController]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAdminDashboardService _dashboardService;

        public AdminDashboardController(IAdminDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("system-stats")]

        public async Task<IActionResult> GetSystemStats()
        {
            var result = await _dashboardService.GetSystemStatsAsync(6);
            return Ok(result);
        }
    }
}
