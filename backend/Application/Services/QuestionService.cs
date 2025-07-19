using AutoMapper;
using AutoMapper.QueryableExtensions;
using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.DTOs.Question;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;
using InterviewPrep.API.Data.Repositories;
using Microsoft.EntityFrameworkCore;

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
            var trends = await _questionRepository.GetCategoryUsageTrendsAsync(
                categoryIds, startDate, endDate, timeUnit);
            return _mapper.Map<IEnumerable<CategoryUsageTrendDTO>>(trends);
        }

        // NEW: Usage ranking using existing QuestionDTO
        public async Task<IEnumerable<QuestionDTO>> GetQuestionsUsageRankingAsync(
            List<int>? categoryIds,
            DateTime? startDate,
            DateTime? endDate,
            bool orderByUsageDescending = true,
            int? topN = null)
        {
            var questions = await _questionRepository.GetQuestionsUsageRankingAsync(
                categoryIds, startDate, endDate, orderByUsageDescending, topN);
            return _mapper.Map<IEnumerable<QuestionDTO>>(questions);
        }

        public async Task<PaginatedResultDto<QuestionForCustomerDto>> GetQuestionsAsync(string? search, int? categoryId, string? difficultyLevel, int pageNumber, int pageSize)
        {
            var query = _questionRepository.GetActiveQuestionsQuery();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(q => q.Content.Contains(search));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(q => q.QuestionCategories.Any(qc => qc.CategoryId == categoryId.Value));
            }

            if (!string.IsNullOrWhiteSpace(difficultyLevel) && Enum.TryParse<DifficultyLevel>(difficultyLevel, true, out var parsedDifficulty))
            {
                query = query.Where(q => q.DifficultyLevel == parsedDifficulty);
            }


            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ProjectTo<QuestionForCustomerDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return new PaginatedResultDto<QuestionForCustomerDto>(items, totalCount, pageNumber, pageSize);
        }

        public async Task<QuestionForCustomerDto?> GetActiveQuestionByIdAsync(long id)
        {
            var question = await _questionRepository.GetActiveQuestionByIdAsync(id);
            if (question == null)
            {
                return null;
            }
            return _mapper.Map<QuestionForCustomerDto>(question);
        }
    }
}
