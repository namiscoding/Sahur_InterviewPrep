using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;

namespace InterviewPrep.API.Data.Repositories
{
    public interface IQuestionRepository
    {
        Task<IEnumerable<Question>> GetAllQuestionsAsync();
        Task<IEnumerable<Question>> SearchQuestionsAsync(string? quesContent, bool? isActive, int? quesDifficultyLevel);
        Task<IEnumerable<Question>> GetQuestionsSortedByUsageCountAsync(bool descending = true);
        Task<Question> AddQuestionAsync(Question question, List<int>? categoryIds, List<int>? tagIds);
        Task<Question?> GetQuestionByIdAsync(long id);
        Task<Question> UpdateQuestionAsync(Question question, List<int>? categoryIds, List<int>? tagIds);

    }
}
