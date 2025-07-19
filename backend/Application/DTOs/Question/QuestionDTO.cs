using InterviewPrep.API.Application.DTOs.Category;
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

        public List<CategoryDTO> Categories { get; set; } = new();

        public static QuestionDTO MapToDTO(Question question)
        {
            return new QuestionDTO
            {
                Id = question.Id,
                Content = question.Content,
                SampleAnswer = question.SampleAnswer,
                DifficultyLevel = question.DifficultyLevel,
                IsActive = question.IsActive,
                UsageCount = question.UsageCount,
                Categories = question.QuestionCategories
                    .Where(qc => qc.Category != null)
                    .Select(qc => new CategoryDTO
                    {
                        Id = qc.Category.Id,
                        Name = qc.Category.Name,
                        Description = qc.Category.Description,
                        IsActive = qc.Category.IsActive
                    }).ToList()
            };
        }
    }
}
