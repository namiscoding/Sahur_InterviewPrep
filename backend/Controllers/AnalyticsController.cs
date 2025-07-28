using InterviewPrep.API.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrep.API.Controllers
{
    [ApiController]
    [Route("api/business/analytics")]
    [Authorize(Roles = "BusinessAdmin")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("user-engagement")]
        public async Task<IActionResult> GetUserEngagement(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var metrics = await _analyticsService.GetUserEngagementMetricsAsync(startDate, endDate);
            return Ok(metrics);
        }

        [HttpGet("staff-performance")]
        public async Task<IActionResult> GetStaffPerformance(
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? staffId)
        {
            var performanceData = await _analyticsService.GetStaffPerformanceAsync(startDate, endDate, staffId);
            return Ok(performanceData);
        }
    }
}
