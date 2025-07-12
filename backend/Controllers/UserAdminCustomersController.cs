// Controllers/UserAdminCustomersController.cs (Return PagedResult)
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Application.DTOs.User;
using System.Threading.Tasks;

namespace InterviewPrep.API.Controllers
{
    [Route("api/useradmin/customers")]
    [ApiController]
    //[Authorize(Roles = "UserAdmin")]
    public class UserAdminCustomersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserAdminCustomersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<UserDTO>>> GetAllCustomers(
            [FromQuery] string search = null,
            [FromQuery] string status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _userService.GetAllCustomersAsync(search, status, page, pageSize);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDetailDTO>> GetCustomerDetails(string id)
        {
            var customer = await _userService.GetCustomerDetailsAsync(id);
            if (customer == null) return NotFound();
            return Ok(customer);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<UserDTO>> UpdateCustomerStatus(string id, [FromBody] UpdateUserStatusDTO updateDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var updated = await _userService.UpdateUserStatusAsync(id, updateDto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }
    }
}