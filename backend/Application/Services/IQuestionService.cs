
using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.DTOs.Question;

namespace InterviewPrep.API.Application.Services
{
    public interface IQuestionService
    {
        Task<IEnumerable<QuestionDTO>> GetAllQuestionsAsync();
        Task<QuestionDTO> AddQuestionAsync(CreateQuestionDTO createDto, string userId);
        Task<QuestionDTO?> GetQuestionByIdAsync(long id);
        Task<QuestionDTO?> UpdateQuestionInfoAsync(long id, UpdateQuestionInfoDTO updateDto, string userId); 
        Task<QuestionDTO?> UpdateQuestionStatusAsync(long id, UpdateQuestionStatusDTO updateDto, string userId); 
        Task<IEnumerable<QuestionDTO>> SearchQuestionsAsync(string? quesContent, bool? isActive, int? quesDifficultyLevel);
        Task<IEnumerable<QuestionDTO>> GetQuestionsSortedByUsageCountAsync(bool descending = true);
        Task<IEnumerable<QuestionDTO>> GetQuestionsForAnalyticsAsync(
            List<int>? categoryIds,
            DateTime? startDate,
            DateTime? endDate,
            bool orderByUsageDescending,
            int? topN);

        Task<IEnumerable<CategoryUsageTrendDTO>> GetCategoryUsageTrendsAsync(
            List<int>? categoryIds,
            DateTime? startDate,
            DateTime? endDate,
            string timeUnit = "month");

        Task<PaginatedResultDto<QuestionForCustomerDto>> GetQuestionsAsync(string? search, int? categoryId, string? difficultyLevel, int pageNumber, int pageSize);
        Task<QuestionForCustomerDto?> GetActiveQuestionByIdAsync(long id);

    }
}
        
