using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.User
{
    public class LoginDto
    {

        [Required]
        public string EmailOrUserName { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;
    }

}
