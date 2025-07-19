using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.DTOs.Question;
using InterviewPrep.API.Application.Services;
using Microsoft.AspNetCore.Authorization;
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
                userId = "user3_id";
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
                userId = "user3_id";
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
        [HttpGet("staff/questions/{id}")] 
        public async Task<ActionResult<QuestionDTO>> GetQuestionById(long id)
        {
            var question = await _questionService.GetQuestionByIdAsync(id);
            if (question == null)
            {
                return NotFound();
            }
            // Đảm bảo rằng GetQuestionByIdAsync trả về QuestionDTO hoặc bạn ánh xạ nó ở đây
            return Ok(question);
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
                userId = "user3_id";
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
                userId = "user3_id";
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


        [HttpGet("staff/questions/category-trends")]
        public async Task<ActionResult<IEnumerable<CategoryUsageTrendDTO>>> GetCategoryUsageTrends(
    [FromQuery] List<int>? categoryIds,
    [FromQuery] DateTime? startDate,
    [FromQuery] DateTime? endDate,
    [FromQuery] string timeUnit = "month")
        {
            try
            {
                // Validate timeUnit parameter
                var validTimeUnits = new[] { "year", "quarter", "month", "week", "day" };
                if (!validTimeUnits.Contains(timeUnit.ToLower()))
                {
                    return BadRequest(new { message = $"Invalid timeUnit. Valid values are: {string.Join(", ", validTimeUnits)}" });
                }

                // Validate date range
                if (startDate.HasValue && endDate.HasValue && startDate.Value > endDate.Value)
                {
                    return BadRequest(new { message = "Start date cannot be greater than end date" });
                }

                Console.WriteLine($"GetCategoryUsageTrends called with:");
                Console.WriteLine($"  CategoryIds: {(categoryIds?.Any() == true ? string.Join(",", categoryIds) : "None")}");
                Console.WriteLine($"  StartDate: {startDate?.ToString("yyyy-MM-dd") ?? "None"}");
                Console.WriteLine($"  EndDate: {endDate?.ToString("yyyy-MM-dd") ?? "None"}");
                Console.WriteLine($"  TimeUnit: {timeUnit}");

                var trends = await _questionService.GetCategoryUsageTrendsAsync(
                    categoryIds, startDate, endDate, timeUnit);

                Console.WriteLine($"Retrieved {trends.Count()} trends");

                if (!trends.Any())
                {
                    return Ok(new List<CategoryUsageTrendDTO>());
                }

                return Ok(trends);
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"ArgumentException in GetCategoryUsageTrends: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in GetCategoryUsageTrends: {ex.Message}");
                Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");

                return StatusCode(500, new
                {
                    message = "Internal server error occurred",
                    details = ex.Message // Remove this in production
                });
            }
        }

        // NEW: Usage ranking endpoint using existing QuestionDTO
        [HttpGet("staff/questions/usage-ranking")]
        //[Authorize(Roles = "Staff,Admin")]
        public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetQuestionsUsageRanking(
            [FromQuery] List<int>? categoryIds,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] bool orderByUsageDescending = true,
            [FromQuery] int? topN = null)
        {
            try
            {
                if (topN.HasValue && topN.Value <= 0)
                {
                    return BadRequest(new { message = "TopN must be a positive number" });
                }

                var ranking = await _questionService.GetQuestionsUsageRankingAsync(
                    categoryIds, startDate, endDate, orderByUsageDescending, topN);

                if (!ranking.Any())
                {
                    return Ok(new List<QuestionDTO>());
                }

                return Ok(ranking);
            }
            catch (Exception ex)
            {
                //_logger.LogError(ex, "Error retrieving questions usage ranking");
                return StatusCode(500, new { message = "Internal server error occurred" });
            }
        }

        // DEPRECATED: Keep for backward compatibility
        [HttpGet("staff/questions/analytics")]
        //[Obsolete("Use /staff/questions/category-trends and /staff/questions/usage-ranking instead")]
        public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetQuestionAnalytics(
            [FromQuery] List<int>? categoryIds,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] bool orderByUsageDescending = true,
            [FromQuery] int? topN = null)
        {
            // Redirect to new usage ranking endpoint
            return await GetQuestionsUsageRanking(categoryIds, startDate, endDate, orderByUsageDescending, topN);
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
