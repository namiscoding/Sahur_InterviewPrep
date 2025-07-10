using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.Category
{
    public class UpdateCategoryStatusDTO
    {
        [Required]
        public bool IsActive { get; set; }
    }
}
