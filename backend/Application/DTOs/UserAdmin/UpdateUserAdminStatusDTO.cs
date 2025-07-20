using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.UserAdmin
{
    public class UpdateUserAdminStatusDTO
    {
        [Required]
        public string Status { get; set; } // "Active", "Inactive"
    }
}