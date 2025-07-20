using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Application.DTOs.Staff;
using System.Threading.Tasks;

namespace InterviewPrep.API.Controllers
{
    [Route("api/useradmin/staff")]
    [ApiController]
    //[Authorize(Roles = "UserAdmin")]
    public class UserAdminStaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public UserAdminStaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }




        [HttpGet]
        public async Task<ActionResult<PagedResult<StaffDTO>>> GetAllStaff(
            [FromQuery] string search = null,
            [FromQuery] string status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _staffService.GetAllStaffAsync(search, status, page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StaffDTO>> GetStaffById(string id)
        {
            var staff = await _staffService.GetStaffByIdAsync(id);
            if (staff == null) return NotFound();
            return Ok(staff);
        }

        [HttpPost]
        public async Task<ActionResult<StaffDTO>> CreateStaff([FromBody] CreateStaffDTO createDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _staffService.CreateStaffAsync(createDto);
            return CreatedAtAction(nameof(GetStaffById), new { id = created.Id }, created);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<StaffDTO>> UpdateStaffStatus(string id, [FromBody] UpdateStaffStatusDTO updateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var updated = await _staffService.UpdateStaffStatusAsync(id, updateDto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpPost("{id}/reset-password")]
        public async Task<ActionResult<string>> ResetStaffPassword(string id)
        {
            var tempPassword = await _staffService.ResetStaffPasswordAsync(id);
            return Ok(tempPassword); // Return temp password - in prod, consider emailing instead
        }
    }
}