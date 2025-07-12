using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.DTOs.Question;
using InterviewPrep.API.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InterviewPrep.API.Controllers
{
    [Route("api")]
    [ApiController]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestionService _questionService;
        private readonly IExcelImporterService _excelImporterService;
        public QuestionController(IQuestionService questionService, IExcelImporterService excelImporterService)
        {
            _questionService = questionService;
            _excelImporterService = excelImporterService;
        }

        [HttpGet("staff/questions")]
        public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetAllQuestions()
        {
            var questions = await _questionService.GetAllQuestionsAsync();
            return Ok(questions);
        }


        [HttpGet("staff/questions/search")]
        public async Task<ActionResult<IEnumerable<QuestionDTO>>> SearchQuestion([FromQuery] string? content, [FromQuery] bool? isActive, [FromQuery] int? difficultyLevel)
        {
            if (string.IsNullOrWhiteSpace(content) && !isActive.HasValue && !difficultyLevel.HasValue)
            {
                return await GetAllQuestions();
            }

            var questions = await _questionService.SearchQuestionAsync(content, isActive, difficultyLevel);

            if (!questions.Any())
            {
                return NotFound("Khong tim thay cau hoi");
            }

            return Ok(questions);
        }

        [HttpGet("staff/questions/sorted-by-usage")]
        public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetQuestionsSortedByUsageCount([FromQuery] bool descending = true)
        {
            var questions = await _questionService.GetQuestionsSortedByUsageCountAsync(descending);

            if (!questions.Any())
            {
                return NotFound("No questions available to sort.");
            }

            return Ok(questions);
        }

        [HttpPost("staff/questions")]
        public async Task<ActionResult<QuestionDTO>> AddQuestion([FromBody] CreateQuestionDTO createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                userId = "A96EA2FC-E8C7-44DB-9862-9BC87C0B583B"; 
                if (string.IsNullOrEmpty(userId)) 
                {
                    return Unauthorized("User is not authenticated or user ID not found.");
                }
            }

            var newQuestion = await _questionService.AddQuestionAsync(createDto, userId);

            return CreatedAtAction(nameof(GetAllQuestions), newQuestion);
        }

        [HttpPost("staff/questions/import-excel")]
        [Consumes("multipart/form-data")] // Chỉ định kiểu dữ liệu đầu vào là form-data
        public async Task<ActionResult<IEnumerable<QuestionDTO>>> ImportQuestions([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded or file is empty.");
            }

            if (!Path.GetExtension(file.FileName).Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Only .xlsx files are allowed.");
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                // Tạm thời cho dev/test, hãy thay bằng ID user thực sự trong DB
                userId = "A96EA2FC-E8C7-44DB-9862-9BC87C0B583B";
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User is not authenticated or user ID not found.");
                }
            }

            try
            {
                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    var importedQuestions = await _excelImporterService.ImportQuestionsFromExcelAsync(stream, userId);
                    return Ok(importedQuestions);
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the exception (use a logging framework like Serilog/NLog)
                Console.WriteLine($"Error importing Excel: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error importing questions from Excel file.");
            }
        }

        [HttpGet("staff/questions/{id}")]
        public async Task<ActionResult<QuestionDTO>> GetQuestionById(long id)
        {
            var question = await _questionService.GetQuestionByIdAsync(id);
            if (question == null)
            {
                return NotFound($"Question with ID {id} not found.");
            }
            return Ok(question);
        }


        [HttpPut("staff/questions/{id}")]
        public async Task<ActionResult<QuestionDTO>> UpdateQuestionInfo(long id, [FromBody] UpdateQuestionInfoDTO updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedQuestion = await _questionService.UpdateQuestionInfoAsync(id, updateDto);

            if (updatedQuestion == null)
            {
                return NotFound($"Question with ID {id} not found.");
            }

            return Ok(updatedQuestion);
        }

        [HttpPatch("staff/questions/{id}/status")] 
        public async Task<ActionResult<QuestionDTO>> UpdateQuestionStatus(long id, [FromBody] UpdateQuestionStatusDTO updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updatedQuestion = await _questionService.UpdateQuestionStatusAsync(id, updateDto);

            if (updatedQuestion == null)
            {
                return NotFound($"Question with ID {id} not found.");
            }

            return Ok(updatedQuestion);
        }

        [HttpGet("questions")]
        public async Task<ActionResult<PaginatedResultDto<QuestionForCustomerDto>>> GetQuestions(
           [FromQuery] string? search,
           [FromQuery] int? categoryId,
           [FromQuery] string? difficultyLevel,
           [FromQuery] int pageNumber = 1,
           [FromQuery] int pageSize = 10)
        {
            var result = await _questionService.GetQuestionsAsync(search, categoryId, difficultyLevel, pageNumber, pageSize);
            return Ok(result);
        }

        [HttpGet("questions/{id}")]
        public async Task<ActionResult<QuestionForCustomerDto>> GetQuestionByIdForCustomer(long id)
        {
            var question = await _questionService.GetActiveQuestionByIdAsync(id);

            if (question == null)
            {
                return NotFound();
            }

            return Ok(question);
        }
    }
}
