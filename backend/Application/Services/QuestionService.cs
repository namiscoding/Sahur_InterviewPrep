using AutoMapper;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.DTOs.Question;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Repositories;

namespace InterviewPrep.API.Application.Services
{
    public class QuestionService : IQuestionService
    {
        private readonly IQuestionRepository _questionRepository;
        private readonly IMapper _mapper;

        public QuestionService(IQuestionRepository questionRepository, IMapper mapper)
        {
            _questionRepository = questionRepository;
            _mapper = mapper;
        }
        public async Task<IEnumerable<QuestionDTO>> GetAllQuestionsAsync()
        {
            var questions = await _questionRepository.GetAllQuestionsAsync();
            return _mapper.Map<IEnumerable<QuestionDTO>>(questions);
        }

        public async Task<IEnumerable<QuestionDTO>> SearchQuestionsAsync(string? quesContent, bool? isActive, int? quesDifficultyLevel)
        {
            var questions = await _questionRepository.SearchQuestionsAsync(quesContent, isActive, quesDifficultyLevel);
            return _mapper.Map<IEnumerable<QuestionDTO>>(questions);
        }

        public async Task<IEnumerable<QuestionDTO>> GetQuestionsSortedByUsageCountAsync(bool descending = true)
        {
            var questions = await _questionRepository.GetQuestionsSortedByUsageCountAsync(descending);
            return _mapper.Map<IEnumerable<QuestionDTO>>(questions);
        }

        public async Task<QuestionDTO> AddQuestionAsync(CreateQuestionDTO createDto, string userId)
        {
            var questionToAdd = _mapper.Map<Question>(createDto);

            var addedQuestion = await _questionRepository.AddQuestionAsync(questionToAdd, createDto.CategoryIds, createDto.TagNames, userId);

            return _mapper.Map<QuestionDTO>(addedQuestion);
        }

        public async Task<QuestionDTO?> GetQuestionByIdAsync(long id)
        {
            var question = await _questionRepository.GetQuestionByIdAsync(id);
            return _mapper.Map<QuestionDTO>(question);
        }

        public async Task<QuestionDTO?> UpdateQuestionInfoAsync(long id, UpdateQuestionInfoDTO updateDto, string userId)
        {
            var existingQuestion = await _questionRepository.GetQuestionByIdAsync(id);
            if (existingQuestion == null)
            {
                return null;
            }

            _mapper.Map(updateDto, existingQuestion);

            var updatedQuestion = await _questionRepository.UpdateQuestionAsync(existingQuestion, updateDto.CategoryIds, updateDto.TagNames, userId);

            return _mapper.Map<QuestionDTO>(updatedQuestion);
        }

        public async Task<QuestionDTO?> UpdateQuestionStatusAsync(long id, UpdateQuestionStatusDTO updateDto, string userId)
        {
            var existingQuestion = await _questionRepository.GetQuestionByIdAsync(id);
            if (existingQuestion == null)
            {
                return null;
            }

            existingQuestion.IsActive = updateDto.IsActive;

            var updatedQuestion = await _questionRepository.UpdateQuestionAsync(existingQuestion, null, null, userId);

            return _mapper.Map<QuestionDTO>(updatedQuestion);
        }

        public async Task<IEnumerable<CategoryUsageTrendDTO>> GetCategoryUsageTrendsAsync(
             List<int>? categoryIds,
             DateTime? startDate,
             DateTime? endDate,
             string timeUnit = "month")
        {
            var trends = await _questionRepository.GetCategoryUsageTrendsAsync(categoryIds, startDate, endDate, timeUnit);
            return _mapper.Map<IEnumerable<CategoryUsageTrendDTO>>(trends);
        }

        public async Task<IEnumerable<QuestionDTO>> GetQuestionsForAnalyticsAsync(List<int>? categoryIds, DateTime? startDate, DateTime? endDate, bool orderByUsageDescending, int? topN)
        {
            var questions = await _questionRepository.GetQuestionsForAnalyticsAsync(categoryIds, startDate, endDate, orderByUsageDescending, topN);
            return _mapper.Map<IEnumerable<QuestionDTO>>(questions);
        }
    }
}
