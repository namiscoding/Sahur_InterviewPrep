using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Application.DTOs.UserAdmin;
using System.Threading.Tasks;

namespace InterviewPrep.API.Controllers
{
    [Route("api/systemadmin/useradmin")]
    [ApiController]
    [Authorize(Roles = "SystemAdmin")]
    public class SystemAdminUserAdminController : ControllerBase
    {
        private readonly IUserAdminService _userAdminService;

        public SystemAdminUserAdminController(IUserAdminService userAdminService)
        {
            _userAdminService = userAdminService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<UserAdminDTO>>> GetAllUserAdmins(
            [FromQuery] string search = null,
            [FromQuery] string status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _userAdminService.GetAllUserAdminsAsync(search, status, page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserAdminDTO>> GetUserAdminById(string id)
        {
            var userAdmin = await _userAdminService.GetUserAdminByIdAsync(id);
            if (userAdmin == null) return NotFound();
            return Ok(userAdmin);
        }

        [HttpPost]
        public async Task<ActionResult<UserAdminDTO>> CreateUserAdmin([FromBody] CreateUserAdminDTO createDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _userAdminService.CreateUserAdminAsync(createDto);
            return CreatedAtAction(nameof(GetUserAdminById), new { id = created.Id }, created);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<UserAdminDTO>> UpdateUserAdminStatus(string id, [FromBody] UpdateUserAdminStatusDTO updateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var updated = await _userAdminService.UpdateUserAdminStatusAsync(id, updateDto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpPost("{id}/reset-password")]
        public async Task<ActionResult<string>> ResetUserAdminPassword(string id)
        {
            var tempPassword = await _userAdminService.ResetUserAdminPasswordAsync(id);
            return Ok(tempPassword); // Return temp password - in prod, consider emailing instead
        }
    }
}