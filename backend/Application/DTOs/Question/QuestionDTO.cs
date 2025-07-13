using InterviewPrep.API.Data.Models.Enums;
using System.Text.Json.Serialization;

namespace InterviewPrep.API.Application.DTOs.Question
{
    public class QuestionDTO
    {
        [JsonIgnore] 
        public long Id { get; set; }
        public string Content { get; set; }
        public string? SampleAnswer { get; set; }
        public DifficultyLevel DifficultyLevel { get; set; }
        public bool IsActive { get; set; }
        public int UsageCount { get; set; }
    }
}
