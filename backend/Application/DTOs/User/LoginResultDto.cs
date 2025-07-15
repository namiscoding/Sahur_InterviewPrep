namespace InterviewPrep.API.Application.DTOs.User
{
    public class LoginResultDto
    {
        public string Message { get; set; } = "Đăng nhập thành công";
        public string Token { get; set; } = null!;
        public UserDto User { get; set; } = null!;
    }
}
