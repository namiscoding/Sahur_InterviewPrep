using InterviewPrep.API.Application.DTOs.Audit; // Đảm bảo include này để sử dụng SAAuditLogDTO
using InterviewPrep.API.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace InterviewPrep.API.Controllers
{
    [Route("api/admin/audit-logs")]
    [ApiController]
    // [Authorize(Roles = "Admin")]
    public class AuditLogController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<AuditLogController> _logger;

        public AuditLogController(IAuditLogService auditLogService, ILogger<AuditLogController> logger)
        {
            _auditLogService = auditLogService;
            _logger = logger;
        }

        // Cập nhật kiểu trả về sang SAAuditLogDTO
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SAAuditLogDTO>>> GetAuditLogs(
            [FromQuery] string? userId,
            [FromQuery] string? userName,
            [FromQuery] string? userRole,
            [FromQuery] string? area,
            [FromQuery] string? actionType,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            try
            {
                var logs = await _auditLogService.GetFilteredAndParsedAuditLogsAsync(
                    userId,
                    userName,
                    userRole,
                    area,
                    actionType,
                    startDate,
                    endDate
                );
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching audit logs with filters. UserId: {UserId}, UserName: {UserName}, Role: {Role}, Area: {Area}, ActionType: {ActionType}, StartDate: {StartDate}, EndDate: {EndDate}",
                    userId, userName, userRole, area, actionType, startDate, endDate);
                return StatusCode(500, "An error occurred while retrieving audit logs.");
            }
        }
    }
}