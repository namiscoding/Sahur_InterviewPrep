using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Application.DTOs.Audit;
using System;
using System.Threading.Tasks;

namespace InterviewPrep.API.Controllers
{
    [Route("api/admin/audit")]
    [ApiController]
    //[Authorize(Roles = "UserAdmin")]
    public class AdminAuditController : ControllerBase
    {
        private readonly IAuditLogService _auditService;

        public AdminAuditController(IAuditLogService auditService)
        {
            _auditService = auditService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<AuditLogDTO>>> GetAllAuditLogs(
            [FromQuery] string userId = null,
            [FromQuery] string action = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            var result = await _auditService.GetAllAuditLogsAsync(userId, action, from, to, page, pageSize);
            return Ok(result);
        }
    }
}