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

        public async Task<IEnumerable<QuestionDTO>> SearchQuestionAsync(string? quesContent, bool? isActive, int? quesDifficultyLevel)
        {
            var questions = await _questionRepository.SearchQuestionsAsync(quesContent, isActive, quesDifficultyLevel);
            return _mapper.Map<IEnumerable<QuestionDTO>>(questions);
        }

        public async Task<IEnumerable<QuestionDTO>> GetQuestionsSortedByUsageCountAsync(bool descending = true)
        {
            var questions = await _questionRepository.GetQuestionsSortedByUsageCountAsync(descending);
            return _mapper.Map<IEnumerable<QuestionDTO>>(questions);
        }

        public async Task<QuestionDTO> AddQuestionAsync(CreateQuestionDTO createDto, string createdByUserId)
        {
            var questionToAdd = _mapper.Map<Question>(createDto);
            questionToAdd.CreatedBy = createdByUserId; 

            var addedQuestion = await _questionRepository.AddQuestionAsync(questionToAdd, createDto.CategoryIds, createDto.TagIds);

            return _mapper.Map<QuestionDTO>(addedQuestion);
        }

        public async Task<QuestionDTO?> GetQuestionByIdAsync(long id)
        {
            var question = await _questionRepository.GetQuestionByIdAsync(id);
            return _mapper.Map<QuestionDTO>(question);
        }


        public async Task<QuestionDTO?> UpdateQuestionInfoAsync(long id, UpdateQuestionInfoDTO updateDto)
        {
            var existingQuestion = await _questionRepository.GetQuestionByIdAsync(id);
            if (existingQuestion == null)
            {
                return null; 
            }

            _mapper.Map(updateDto, existingQuestion);
            var updatedQuestion = await _questionRepository.UpdateQuestionAsync(existingQuestion, updateDto.CategoryIds, updateDto.TagIds);

            return _mapper.Map<QuestionDTO>(updatedQuestion);
        }

        public async Task<QuestionDTO?> UpdateQuestionStatusAsync(long id, UpdateQuestionStatusDTO updateDto)
        {
            var existingQuestion = await _questionRepository.GetQuestionByIdAsync(id);
            if (existingQuestion == null)
            {
                return null;
            }

            existingQuestion.IsActive = updateDto.IsActive; 
            var updatedQuestion = await _questionRepository.UpdateQuestionAsync(existingQuestion, null, null);

            return _mapper.Map<QuestionDTO>(updatedQuestion);
        }
    }
}
