
using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.DTOs.Question;

namespace InterviewPrep.API.Application.Services
{
    public interface IQuestionService
    {
        Task<IEnumerable<QuestionDTO>> GetAllQuestionsAsync();
        Task<IEnumerable<QuestionDTO>> SearchQuestionAsync(string? quesContent, bool? isActive, int? quesDifficultyLevel);
        Task<IEnumerable<QuestionDTO>> GetQuestionsSortedByUsageCountAsync(bool descending = true);
        Task<QuestionDTO> AddQuestionAsync(CreateQuestionDTO createDto, string createdByUserId);
        Task<QuestionDTO?> UpdateQuestionInfoAsync(long id, UpdateQuestionInfoDTO updateDto);
        Task<QuestionDTO?> UpdateQuestionStatusAsync(long id, UpdateQuestionStatusDTO updateDto);
        Task<QuestionDTO?> GetQuestionByIdAsync(long id);
        Task<PaginatedResultDto<QuestionForCustomerDto>> GetQuestionsAsync(string? search, int? categoryId, string? difficultyLevel, int pageNumber, int pageSize);
        Task<QuestionForCustomerDto?> GetActiveQuestionByIdAsync(long id);
    }
}
        
