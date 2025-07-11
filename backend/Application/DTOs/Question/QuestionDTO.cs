using InterviewPrep.API.Data.Models.Enums;

namespace InterviewPrep.API.Application.DTOs.Question
{
    public class QuestionDTO
    {
        public string Content { get; set; }
        public string? SampleAnswer { get; set; }
        public DifficultyLevel DifficultyLevel { get; set; }
        public bool IsActive { get; set; }
        public int UsageCount { get; set; }
    }
}
