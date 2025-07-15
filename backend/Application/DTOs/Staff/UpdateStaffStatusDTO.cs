using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.Staff
{
    public class UpdateStaffStatusDTO
    {
        [Required]
        public string Status { get; set; } // "Active", "Inactive", "Suspended"
    }
}