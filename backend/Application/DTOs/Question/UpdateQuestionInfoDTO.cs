using InterviewPrep.API.Data.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.Question
{
    public class UpdateQuestionInfoDTO
    {
        [Required(ErrorMessage = "Content is required.")]
        [StringLength(1000, ErrorMessage = "Content cannot exceed 1000 characters.")]
        public string Content { get; set; }

        public string? SampleAnswer { get; set; }

        [Required(ErrorMessage = "Difficulty Level is required.")]
        public DifficultyLevel DifficultyLevel { get; set; }

        public List<int>? CategoryIds { get; set; }

        public List<int>? TagIds { get; set; }
    }
}
