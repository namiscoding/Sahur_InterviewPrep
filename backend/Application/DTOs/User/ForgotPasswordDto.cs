using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.User
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string EmailOrUserName { get; set; }
    }

    public class ResetPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Token { get; set; }

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }

        [Required]
        [Compare("NewPassword", ErrorMessage = "Mật khẩu xác nhận không khớp.")]
        public string ConfirmPassword { get; set; }
    }

}
