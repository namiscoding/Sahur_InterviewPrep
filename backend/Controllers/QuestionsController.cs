using AutoMapper;
using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Data.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrep.API.Controllers
{
    [ApiController]
    [Route("api/questions")]
    public class QuestionsController : ControllerBase
    {
        private readonly IQuestionRepository _questionRepository;
        private readonly IMapper _mapper;

        public QuestionsController(IQuestionRepository questionRepository, IMapper mapper)
        {
            _questionRepository = questionRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuestionForCustomerDto>>> GetQuestions()
        {
            // 1. Gọi Repository để lấy dữ liệu thô
            var questionsFromDb = await _questionRepository.GetActiveQuestionsAsync();

            // 2. Dùng AutoMapper để chuyển đổi sang DTO
            var questionsDto = _mapper.Map<IEnumerable<QuestionForCustomerDto>>(questionsFromDb);

            // 3. Trả về kết quả cho client
            return Ok(questionsDto);
        }
    }
}
