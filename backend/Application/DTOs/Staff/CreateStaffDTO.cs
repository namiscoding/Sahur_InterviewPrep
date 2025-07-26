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
    }
}