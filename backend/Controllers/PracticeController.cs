using AutoMapper;
using InterviewPrep.API.Application.DTOs.MockSessions;
using InterviewPrep.API.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrep.API.Controllers
{
    [ApiController]
    [Route("api/practice")]
    [Authorize] 
    public class PracticeController : ControllerBase
    {
        private readonly IPracticeService _practiceService;
        private readonly IMapper _mapper; // Inject AutoMapper

        public PracticeController(IPracticeService practiceService, IMapper mapper)
        {
            _practiceService = practiceService;
            _mapper = mapper;
        }

        [HttpPost("start-single")]
        public async Task<IActionResult> StartSingleQuestionPractice([FromBody] StartPracticeRequestDto request)
        {
            var (session, errorMessage) = await _practiceService.StartSingleQuestionPracticeAsync(request.QuestionId);

            if (errorMessage != null)
            {
                // Trả về lỗi 403 Forbidden nếu hết lượt hoặc lỗi khác
                return StatusCode(403, new { Message = errorMessage });
            }

            // Map sang DTO trước khi trả về
            var sessionDto = _mapper.Map<MockSessionDto>(session);
            return Ok(sessionDto);
        }

        [HttpPost("sessions/{sessionId}/submit-single")]
        public async Task<IActionResult> SubmitSingleQuestionAnswer(long sessionId, [FromBody] SubmitAnswerRequestDto request)
        {
            // Logic này đã được chuyển tên thành SubmitAnswerAndCompleteSingleQuestionAsync
            var (result, errorMessage) = await _practiceService.SubmitAnswerAndCompleteSingleQuestionAsync(sessionId, request.UserAnswer);

            if (errorMessage != null)
            {
                return BadRequest(new { Message = errorMessage });
            }

            return Ok(result);
        }

        [HttpPost("start-full")]
        public async Task<IActionResult> StartFullMockInterview([FromBody] CreateFullInterviewRequestDto request)
        {
            var (session, errorMessage) = await _practiceService.StartFullMockInterviewAsync(request);

            if (errorMessage != null)
            {
                return StatusCode(403, new { Message = errorMessage });
            }

            var sessionDto = _mapper.Map<MockSessionDto>(session);
            return Ok(sessionDto);
        }

        [HttpPost("sessions/{sessionId}/submit-answer")]
        public async Task<IActionResult> SubmitFullInterviewAnswer(long sessionId, [FromBody] SubmitFullInterviewAnswerRequestDto request)
        {
            var (answer, errorMessage) = await _practiceService.SubmitAnswerForMockInterviewAsync(sessionId, request);

            if (errorMessage != null)
            {
                return BadRequest(new { Message = errorMessage });
            }

            // Trả về 200 OK với ID của câu trả lời đã được cập nhật
            return Ok(new { sessionAnswerId = answer.Id });
        }

        /// <summary>
        /// Hoàn thành một phiên phỏng vấn đầy đủ và tính lượt sử dụng.
        /// </summary>
        [HttpPost("sessions/{sessionId}/complete")]
        public async Task<IActionResult> CompleteFullInterview(long sessionId)
        {
            var (session, errorMessage) = await _practiceService.CompleteFullMockInterviewAsync(sessionId);

            if (errorMessage != null)
            {
                return BadRequest(new { Message = errorMessage });
            }

            var sessionDto = _mapper.Map<MockSessionDto>(session);
            return Ok(sessionDto);
        }
    }
}
