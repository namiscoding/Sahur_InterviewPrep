using AutoMapper;
using InterviewPrep.API.Application.DTOs.Question;
using InterviewPrep.API.Data.Repositories;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;
using OfficeOpenXml;
using System.IO;
using System.Linq;
using System.Collections.Generic;

namespace InterviewPrep.API.Application.Services
{
    public class ExcelImporterService : IExcelImporterService
    {
        private readonly IQuestionRepository _questionRepository;
        private readonly ICategoryRepository _categoryRepository; 
        private readonly ITagRepository _tagRepository; 
        private readonly IMapper _mapper;

        public ExcelImporterService(IQuestionRepository questionRepository,
                                    ICategoryRepository categoryRepository,
                                    ITagRepository tagRepository,
                                    IMapper mapper)
        {
            _questionRepository = questionRepository;
            _categoryRepository = categoryRepository;
            _tagRepository = tagRepository; 
            _mapper = mapper;
        }

        public async Task<IEnumerable<QuestionDTO>> ImportQuestionsFromExcelAsync(Stream fileStream, string createdByUserId)
        {
            var importedQuestions = new List<Question>();
            //ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage(fileStream))
            {
                var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                if (worksheet == null)
                {
                    throw new ArgumentException("Excel file does not contain any worksheet.");
                }

                int rowCount = worksheet.Dimension.Rows;
                int colCount = worksheet.Dimension.Columns;

                var allCategories = (await _categoryRepository.GetAllCategoriesAsync()).ToList();
                var allTags = (await _tagRepository.GetAllTagsAsync()).ToList();

                for (int row = 2; row <= rowCount; row++) // Bắt đầu từ hàng thứ 2 nếu hàng 1 là header
                {
                    var questionDto = new CreateQuestionDTO();
                    // Đọc dữ liệu từ các cột
                    // Bạn cần ánh xạ cột Excel với thuộc tính DTO của bạn
                    // Ví dụ: Cột A là Content, Cột B là SampleAnswer, v.v.
                    try
                    {
                        questionDto.Content = worksheet.Cells[row, 1].Text.Trim(); // Cột A
                        questionDto.SampleAnswer = worksheet.Cells[row, 2].Text?.Trim(); // Cột B

                        // Chuyển đổi DifficultyLevel từ string sang enum
                        string difficultyStr = worksheet.Cells[row, 3].Text.Trim(); // Cột C
                        if (Enum.TryParse(difficultyStr, true, out DifficultyLevel difficultyLevel))
                        {
                            questionDto.DifficultyLevel = difficultyLevel;
                        }
                        else
                        {
                            // Xử lý lỗi hoặc gán mặc định nếu không parse được
                            Console.WriteLine($"Warning: Invalid DifficultyLevel '{difficultyStr}' in row {row}. Defaulting to Medium.");
                            questionDto.DifficultyLevel = DifficultyLevel.Medium; // Gán mặc định
                        }

                        questionDto.IsActive = bool.Parse(worksheet.Cells[row, 4].Text.Trim()); // Cột D

                        // Xử lý CategoryIds từ tên
                        string categoryNames = worksheet.Cells[row, 5].Text?.Trim(); // Cột E (ví dụ: "Lập trình C#, Databases")
                        if (!string.IsNullOrEmpty(categoryNames))
                        {
                            var names = categoryNames.Split(',').Select(n => n.Trim()).ToList();
                            questionDto.CategoryIds = allCategories
                                .Where(c => names.Contains(c.Name, StringComparer.OrdinalIgnoreCase))
                                .Select(c => c.Id)
                                .ToList();
                        }

                        // Xử lý TagIds từ tên
                        string tagNames = worksheet.Cells[row, 6].Text?.Trim(); // Cột F (ví dụ: "C#, SQL")
                        if (!string.IsNullOrEmpty(tagNames))
                        {
                            var names = tagNames.Split(',').Select(n => n.Trim()).ToList();
                            questionDto.TagIds = allTags
                                .Where(t => names.Contains(t.Name, StringComparer.OrdinalIgnoreCase))
                                .Select(t => t.Id)
                                .ToList();
                        }

                        if (!string.IsNullOrEmpty(questionDto.Content))
                        {
                            var question = _mapper.Map<Question>(questionDto);
                            question.CreatedBy = createdByUserId;
                           

                            var addedQuestion = await _questionRepository.AddQuestionAsync(question, questionDto.CategoryIds, questionDto.TagIds);
                            importedQuestions.Add(addedQuestion);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error importing row {row}: {ex.Message}");
                     
                    }
                }
            }
            return _mapper.Map<IEnumerable<QuestionDTO>>(importedQuestions);
        }
    }
}
