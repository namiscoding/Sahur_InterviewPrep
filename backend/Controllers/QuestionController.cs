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

            var questions = await _questionService.SearchQuestionsAsync(content, isActive, difficultyLevel);

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

            return CreatedAtAction(nameof(GetAllQuestions), new { id = newQuestion.Id }, newQuestion);
        }

        [HttpPost("staff/questions/import-excel")]
        [Consumes("multipart/form-data")]
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
                    stream.Position = 0;
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
                Console.WriteLine($"Error importing Excel: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(StatusCodes.Status500InternalServerError, "Error importing questions from Excel file.");
            }
        }

        [HttpPut("staff/questions/{id}")]
        public async Task<ActionResult<QuestionDTO>> UpdateQuestionInfo(long id, [FromBody] UpdateQuestionInfoDTO updateDto)
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

            var updatedQuestion = await _questionService.UpdateQuestionInfoAsync(id, updateDto, userId);

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

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                userId = "A96EA2FC-E8C7-44DB-9862-9BC87C0B583B";
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User is not authenticated or user ID not found.");
                }
            }

            var updatedQuestion = await _questionService.UpdateQuestionStatusAsync(id, updateDto, userId);

            if (updatedQuestion == null)
            {
                return NotFound($"Question with ID {id} not found.");
            }

            return Ok(updatedQuestion);
        }


        [HttpGet("staff/questions/analytics/trends")]
        public async Task<ActionResult<IEnumerable<CategoryUsageTrendDTO>>> GetCategoryUsageTrends(
             [FromQuery] List<int>? categoryIds,
             [FromQuery] DateTime? startDate,
             [FromQuery] DateTime? endDate,
             [FromQuery] string timeUnit = "month") 
        {
            if (!new[] { "month", "year", "quarter" }.Contains(timeUnit.ToLower()))
            {
                return BadRequest("Invalid timeUnit. Accepted values are 'month', 'year', 'quarter'.");
            }

            var trends = await _questionService.GetCategoryUsageTrendsAsync(
                categoryIds,
                startDate,
                endDate,
                timeUnit
            );

            if (!trends.Any())
            {
                return NotFound("No usage trend data found for the given criteria.");
            }

            return Ok(trends);
        }

        [HttpGet("staff/questions/analytics")]
        public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetQuestionAnalytics(
            [FromQuery] List<int>? categoryIds,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] bool orderByUsageDescending = true,
            [FromQuery] int? topN = null)
        {
            var analyticsData = await _questionService.GetQuestionsForAnalyticsAsync(
                categoryIds,
                startDate,
                endDate,
                orderByUsageDescending,
                topN
            );

            if (!analyticsData.Any())
            {
                return NotFound("No analytics data found for the given criteria.");
            }

            return Ok(analyticsData);
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
