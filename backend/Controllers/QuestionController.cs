using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.DTOs.Question;
using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Data.Models.Enums;
using InterviewPrep.API.Data.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using System.Security.Claims;
using OfficeOpenXml.DataValidation;

namespace InterviewPrep.API.Controllers
{
    [Route("api")]
    [ApiController]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestionService _questionService;
        private readonly IExcelImporterService _excelImporterService;
        private readonly ICategoryRepository _categoryRepository;
        private readonly ITagRepository _tagRepository;


        public QuestionController(
            IQuestionService questionService,
            IExcelImporterService excelImporterService,
            ICategoryRepository categoryRepository,
            ITagRepository tagRepository)
        {
            _questionService = questionService;
            _excelImporterService = excelImporterService;
            _categoryRepository = categoryRepository;
            _tagRepository = tagRepository;
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
                return Unauthorized("User is not authenticated or user ID not found.");
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
                return Unauthorized("User is not authenticated or user ID not found.");
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
                return Unauthorized("User is not authenticated or user ID not found.");
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
                return Unauthorized("User is not authenticated or user ID not found.");
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
                var validTimeUnits = new[] { "year", "quarter", "month", "week", "day" };
                if (!validTimeUnits.Contains(timeUnit.ToLower()))
                {
                    return BadRequest(new { message = $"Invalid timeUnit. Valid values are: {string.Join(", ", validTimeUnits)}" });
                }

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
                    details = ex.Message
                });
            }
        }

        [HttpGet("staff/questions/usage-ranking")]
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
                return StatusCode(500, new { message = "Internal server error occurred" });
            }
        }

        [HttpGet("staff/questions/analytics")]
        [Obsolete("Use /staff/questions/category-trends and /staff/questions/usage-ranking instead")]
        public async Task<ActionResult<IEnumerable<QuestionDTO>>> GetQuestionAnalytics(
            [FromQuery] List<int>? categoryIds,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] bool orderByUsageDescending = true,
            [FromQuery] int? topN = null)
        {
            return await GetQuestionsUsageRanking(categoryIds, startDate, endDate, orderByUsageDescending, topN);
        }

        [HttpGet("customer/questions")]
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

        [HttpGet("customer/questions/{id}")]
        public async Task<ActionResult<QuestionForCustomerDto>> GetQuestionByIdForCustomer(long id)
        {
            var question = await _questionService.GetActiveQuestionByIdAsync(id);

            if (question == null)
            {
                return NotFound();
            }

            return Ok(question);
        }

        [HttpGet("staff/questions/template/download")]
        public async Task<IActionResult> DownloadQuestionExcelTemplate()
        {
            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("QuestionTemplate");

                worksheet.Cells[1, 1].Value = "Content";
                worksheet.Cells[1, 2].Value = "SampleAnswer";
                worksheet.Cells[1, 3].Value = "DifficultyLevel";
                worksheet.Cells[1, 4].Value = "IsActive";
                worksheet.Cells[1, 5].Value = "CategoryNames";
                worksheet.Cells[1, 6].Value = "TagNames";

                worksheet.Cells[1, 1, 1, 6].AutoFitColumns();

                var hiddenListWorksheet = package.Workbook.Worksheets.Add("Lists");
                hiddenListWorksheet.Hidden = eWorkSheetHidden.VeryHidden;

                var difficultyLevels = Enum.GetNames(typeof(DifficultyLevel)).ToList();
                for (int i = 0; i < difficultyLevels.Count; i++)
                {
                    hiddenListWorksheet.Cells[i + 1, 1].Value = difficultyLevels[i];
                }
                var difficultyValidation = worksheet.DataValidations.AddListValidation("C2:C1000");
                difficultyValidation.Formula.ExcelFormula = $"=Lists!$A$1:$A${difficultyLevels.Count}";
                difficultyValidation.PromptTitle = "Chọn mức độ khó";
                difficultyValidation.Prompt = "Vui lòng chọn một trong các mức độ: Easy, Medium, Hard.";

                var activeOptions = new List<string> { "TRUE", "FALSE" };
                for (int i = 0; i < activeOptions.Count; i++)
                {
                    hiddenListWorksheet.Cells[i + 1, 2].Value = activeOptions[i];
                }
                var activeValidation = worksheet.DataValidations.AddListValidation("D2:D1000");
                activeValidation.Formula.ExcelFormula = $"=Lists!$B$1:$B${activeOptions.Count}";
                activeValidation.PromptTitle = "Chọn trạng thái";
                activeValidation.Prompt = "Vui lòng chọn TRUE hoặc FALSE.";

                var allCategories = await _categoryRepository.GetAllCategoriesAsync();
                var categoryNames = allCategories.Select(c => c.Name).ToList();
                for (int i = 0; i < categoryNames.Count; i++)
                {
                    hiddenListWorksheet.Cells[i + 1, 3].Value = categoryNames[i];
                }
                var categoryValidation = worksheet.DataValidations.AddListValidation("E2:E1000");
                categoryValidation.Formula.ExcelFormula = $"=Lists!$C$1:$C${categoryNames.Count}";
                categoryValidation.PromptTitle = "Chọn (các) Category";
                categoryValidation.Prompt = "Chọn từ danh sách. Nếu nhiều, cách nhau bằng dấu phẩy (,).";

                var allTags = await _tagRepository.GetAllTagsAsync();
                var tagNames = allTags.Select(t => t.Name).ToList();
                for (int i = 0; i < tagNames.Count; i++)
                {
                    hiddenListWorksheet.Cells[i + 1, 4].Value = tagNames[i];
                }
                var tagValidation = worksheet.DataValidations.AddListValidation("F2:F1000");
                tagValidation.Formula.ExcelFormula = $"=Lists!$D$1:$D${tagNames.Count}";
                tagValidation.PromptTitle = "Chọn (các) Tag";
                tagValidation.Prompt = "Chọn từ danh sách. Nếu nhiều, cách nhau bằng dấu phẩy (,). Tag mới sẽ được tạo tự động nếu chưa tồn tại.";

                var contentComment = worksheet.Cells["A1"].AddComment("Nội dung chính của câu hỏi (bắt buộc).", "Hệ thống");
                var sampleAnswerComment = worksheet.Cells["B1"].AddComment("Câu trả lời mẫu (có thể để trống).", "Hệ thống");
                var difficultyComment = worksheet.Cells["C1"].AddComment("Mức độ khó của câu hỏi. Vui lòng chọn từ danh sách dropdown.", "Hệ thống");
                var activeComment = worksheet.Cells["D1"].AddComment("Trạng thái hoạt động của câu hỏi. Vui lòng chọn TRUE hoặc FALSE.", "Hệ thống");
                var categoryComment = worksheet.Cells["E1"].AddComment("Tên các Category liên quan. Nếu có nhiều, cách nhau bằng dấu phẩy (ví dụ: 'C#, OOP'). Phải là Category đã tồn tại.", "Hệ thống");
                var tagComment = worksheet.Cells["F1"].AddComment("Tên các Tag liên quan. Nếu có nhiều, cách nhau bằng dấu phẩy (ví dụ: 'SQL, Database'). Tag sẽ được tạo tự động nếu chưa tồn tại.", "Hệ thống");


                var fileBytes = package.GetAsByteArray();

                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "QuestionTemplate.xlsx");
            }
        }
    }
}