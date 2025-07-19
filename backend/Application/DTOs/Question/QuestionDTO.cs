using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;
using System.Text.Json.Serialization;

namespace InterviewPrep.API.Application.DTOs.Question
{
    public class QuestionDTO
    {
        
        public long Id { get; set; }
        public string Content { get; set; }
        public string? SampleAnswer { get; set; }
        public DifficultyLevel DifficultyLevel { get; set; }
        public bool IsActive { get; set; }
        public int UsageCount { get; set; }
        public List<CategoryDTO>? Categories { get; set; }
        public List<TagDTO>? Tags { get; set; }
    }
}
