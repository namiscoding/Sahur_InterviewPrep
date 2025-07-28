using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Application.DTOs.SystemSetting;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace InterviewPrep.API.Controllers
{
    [Route("api/systemadmin/systemsetting")]
    [ApiController]
    [Authorize(Roles = "SystemAdmin")]
    public class SystemAdminSystemSettingController : ControllerBase
    {
        private readonly ISystemSettingService _systemSettingService;

        public SystemAdminSystemSettingController(ISystemSettingService systemSettingService)
        {
            _systemSettingService = systemSettingService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<SystemSettingDTO>>> GetAllSystemSettings([FromQuery] string prefix = null, [FromQuery] string search = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _systemSettingService.GetAllSystemSettingsAsync(prefix, search, page, pageSize);
            return Ok(result);
        }

        [HttpGet("{key}")]
        public async Task<ActionResult<SystemSettingDTO>> GetSystemSettingByKey(string key)
        {
            var systemSetting = await _systemSettingService.GetSystemSettingByKeyAsync(key);
            if (systemSetting == null) return NotFound();
            return Ok(systemSetting);
        }

        [HttpPost]
        public async Task<ActionResult<SystemSettingDTO>> CreateSystemSetting([FromBody] CreateSystemSettingDTO createDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _systemSettingService.CreateSystemSettingAsync(createDto);
            return CreatedAtAction(nameof(GetSystemSettingByKey), new { key = created.SettingKey }, created);
        }

        [HttpPut("{key}")]
        public async Task<ActionResult<SystemSettingDTO>> UpdateSystemSetting(string key, [FromBody] UpdateSystemSettingDTO updateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var updated = await _systemSettingService.UpdateSystemSettingAsync(key, updateDto);
            return Ok(updated);
        }
    }
}