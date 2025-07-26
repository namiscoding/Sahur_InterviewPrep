using InterviewPrep.API.Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using InterviewPrep.API.Application.DTOs;
namespace InterviewPrep.API.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet("profile")] // Endpoint sẽ là /api/user/profile
        public async Task<IActionResult> GetUserProfile()
        {
            //var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userId = "user5_id";
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Bạn có thể tạo một DTO cho UserProfile để trả về các thông tin cần thiết
            var userProfileDto = new UserProfileDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName ?? user.UserName,
                SubscriptionLevel = (int)user.SubscriptionLevel, // Ép kiểu nếu SubscriptionLevel là enum
                SubscriptionExpiryDate = user.SubscriptionExpiryDate?.ToString("yyyy-MM-ddTHH:mm:ssZ") // Định dạng ISO 8601
            };

            return Ok(userProfileDto);
        }
    }
}
