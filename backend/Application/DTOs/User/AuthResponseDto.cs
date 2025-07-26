using InterviewPrep.API.Data.Models.Enums;

namespace InterviewPrep.API.Application.DTOs.User
{
    public class AuthResponseDto
    {
        public string Message { get; set; } = "Đăng ký thành công";
        public string Token { get; set; } = null!;
        public UserDto User { get; set; } = null!;
    }

    public class UserDto
    {
        public string Id { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public UserStatus Status { get; set; }
        public SubscriptionLevel SubscriptionLevel { get; set; }
        public DateTime? SubscriptionExpiryDate { get; set; }
    }
}
