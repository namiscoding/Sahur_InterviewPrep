using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.User
{
    public class UpdateUserStatusDTO
    {
        [Required]
        public string Status { get; set; } // "Active", "Inactive", "Suspended"
    }
}