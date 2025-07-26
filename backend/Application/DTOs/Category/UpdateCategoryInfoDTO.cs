using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.Category
{
    public class UpdateCategoryInfoDTO
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        public string? Description { get; set; }
    }
}
