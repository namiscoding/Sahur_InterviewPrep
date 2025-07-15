using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.Staff
{
    public class CreateStaffDTO
    {
        [Required]
        [StringLength(100)]
        public string DisplayName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string Password { get; set; }
    }
}