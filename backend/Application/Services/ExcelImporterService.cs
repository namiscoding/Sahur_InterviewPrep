using AutoMapper;
using InterviewPrep.API.Application.DTOs.Question;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;
using InterviewPrep.API.Data.Repositories;
using OfficeOpenXml;
using System.Collections.Generic;
using System.IO;
using System.Linq;

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
            //ExcelPackage.License = new ExcelPackageLicense(); // Đảm bảo license được thiết lập đúng cách cho EPPlus 8+ trong Program.cs

            using (var package = new ExcelPackage(fileStream))
            {
                var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                if (worksheet == null)
                {
                    throw new ArgumentException("Excel file does not contain any worksheet.");
                }

                int rowCount = worksheet.Dimension.Rows;

                var allCategories = (await _categoryRepository.GetAllCategoriesAsync()).ToList();

                for (int row = 2; row <= rowCount; row++)
                {
                    var questionDto = new CreateQuestionDTO();
                    try
                    {
                        questionDto.Content = worksheet.Cells[row, 1].Text.Trim(); // Cột A
                        questionDto.SampleAnswer = worksheet.Cells[row, 2].Text?.Trim(); // Cột B

                        string difficultyStr = worksheet.Cells[row, 3].Text.Trim(); // Cột C
                        if (Enum.TryParse(difficultyStr, true, out DifficultyLevel difficultyLevel))
                        {
                            questionDto.DifficultyLevel = difficultyLevel;
                        }
                        else
                        {
                            Console.WriteLine($"Warning: Invalid DifficultyLevel '{difficultyStr}' in row {row}. Defaulting to Medium.");
                            questionDto.DifficultyLevel = DifficultyLevel.Medium;
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

                        // Xử lý TagNames từ tên (đã đổi sang List<string>)
                        string tagNamesString = worksheet.Cells[row, 6].Text?.Trim(); // Cột F (ví dụ: "C#, SQL")
                        if (!string.IsNullOrEmpty(tagNamesString))
                        {
                            questionDto.TagNames = tagNamesString.Split(',').Select(n => n.Trim()).ToList();
                        }
                        else
                        {
                            questionDto.TagNames = new List<string>(); // Đảm bảo không null
                        }

                        // Tạo Question Model và thêm vào DB
                        if (!string.IsNullOrEmpty(questionDto.Content))
                        {
                            var question = _mapper.Map<Question>(questionDto);
                            var addedQuestion = await _questionRepository.AddQuestionAsync(question, questionDto.CategoryIds, questionDto.TagNames, createdByUserId); // Đã thêm createdByUserId
                            importedQuestions.Add(addedQuestion);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error importing row {row}: {ex.Message}");
                        // Ghi lại lỗi để báo cáo cho người dùng sau
                    }
                }
            }
            return _mapper.Map<IEnumerable<QuestionDTO>>(importedQuestions);
        }
    }
}