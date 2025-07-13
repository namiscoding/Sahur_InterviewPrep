using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;

namespace InterviewPrep.API.Data.Repositories
{
    public interface IQuestionRepository
    {
        Task<IEnumerable<Question>> GetActiveQuestionsAsync();
        Task<IEnumerable<Question>> GetAllQuestionsAsync();
        Task<Question> AddQuestionAsync(Question question, List<int>? categoryIds, List<string>? tagNames, string userId);
        Task<Question?> GetQuestionByIdAsync(long id);
        Task<Question> UpdateQuestionAsync(Question question, List<int>? categoryIds, List<string>? tagNames, string userId);
        Task<IEnumerable<Question>> SearchQuestionsAsync(string? quesContent, bool? isActive, int? quesDifficultyLevel);
        Task<IEnumerable<Question>> GetQuestionsSortedByUsageCountAsync(bool descending = true);
        Task<IEnumerable<Question>> GetQuestionsForAnalyticsAsync(
            List<int>? categoryIds,
            DateTime? startDate,
            DateTime? endDate,
            bool orderByUsageDescending,
            int? topN);


        Task<IEnumerable<CategoryUsageTrend>> GetCategoryUsageTrendsAsync(
            List<int>? categoryIds,
            DateTime? startDate,
            DateTime? endDate,
            string timeUnit = "month");
      
        IQueryable<Question> GetActiveQuestionsQuery();
        Task<Question?> GetActiveQuestionByIdAsync(long id);
    }

    public class CategoryUsageTrend
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public long TotalUsageCount { get; set; }
        public int NumberOfQuestions { get; set; }
    }
}
