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

                        // FIX: Xử lý DifficultyLevel - hỗ trợ cả số và text
                        string difficultyStr = worksheet.Cells[row, 3].Text.Trim(); // Cột C
                        questionDto.DifficultyLevel = ParseDifficultyLevel(difficultyStr, row);

                        questionDto.IsActive = bool.Parse(worksheet.Cells[row, 4].Text.Trim()); // Cột D

                        // Xử lý CategoryIds từ tên
                        string categoryNames = worksheet.Cells[row, 5].Text?.Trim(); // Cột E
                        if (!string.IsNullOrEmpty(categoryNames))
                        {
                            var names = categoryNames.Split(',').Select(n => n.Trim()).ToList();
                            questionDto.CategoryIds = allCategories
                                .Where(c => names.Contains(c.Name, StringComparer.OrdinalIgnoreCase))
                                .Select(c => c.Id)
                                .ToList();
                        }

                        // Xử lý TagNames từ tên
                        string tagNamesString = worksheet.Cells[row, 6].Text?.Trim(); // Cột F
                        if (!string.IsNullOrEmpty(tagNamesString))
                        {
                            questionDto.TagNames = tagNamesString.Split(',').Select(n => n.Trim()).ToList();
                        }
                        else
                        {
                            questionDto.TagNames = new List<string>();
                        }

                        // Tạo Question Model và thêm vào DB
                        if (!string.IsNullOrEmpty(questionDto.Content))
                        {
                            var question = _mapper.Map<Question>(questionDto);
                            var addedQuestion = await _questionRepository.AddQuestionAsync(question, questionDto.CategoryIds, questionDto.TagNames, createdByUserId);
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

        /// <summary>
        /// Parse DifficultyLevel từ string, hỗ trợ cả số (0,1,2) và text (Easy, Medium, Hard)
        /// </summary>
        private DifficultyLevel ParseDifficultyLevel(string difficultyStr, int row)
        {
            if (string.IsNullOrEmpty(difficultyStr))
            {
                Console.WriteLine($"Warning: Empty DifficultyLevel in row {row}. Defaulting to Medium.");
                return DifficultyLevel.Medium;
            }

            // Thử parse bằng số trước (0, 1, 2)
            if (int.TryParse(difficultyStr, out int numericValue))
            {
                Console.WriteLine($"Row {row}: Parsing numeric difficulty '{difficultyStr}' as {numericValue}");

                switch (numericValue)
                {
                    case 0: return DifficultyLevel.Easy;
                    case 1: return DifficultyLevel.Medium;
                    case 2: return DifficultyLevel.Hard;
                    default:
                        Console.WriteLine($"Warning: Invalid numeric DifficultyLevel '{numericValue}' in row {row}. Must be 0, 1, or 2. Defaulting to Medium.");
                        return DifficultyLevel.Medium;
                }
            }

            // Thử parse bằng text (Easy, Medium, Hard)
            if (Enum.TryParse(difficultyStr, true, out DifficultyLevel difficultyLevel))
            {
                Console.WriteLine($"Row {row}: Parsing text difficulty '{difficultyStr}' as {difficultyLevel}");
                return difficultyLevel;
            }

            // Thử parse các alias khác
            string normalizedStr = difficultyStr.ToLowerInvariant().Trim();
            switch (normalizedStr)
            {
                case "0":
                case "easy":
                case "Easy":
                case "dễ":
                case "de":
                    Console.WriteLine($"Row {row}: Mapping '{difficultyStr}' to Easy");
                    return DifficultyLevel.Easy;

                case "1":
                case "medium":
                case "Medium":
                case "trung bình":
                case "tb":
                case "medium level":
                    Console.WriteLine($"Row {row}: Mapping '{difficultyStr}' to Medium");
                    return DifficultyLevel.Medium;

                case "2":
                case "hard":
                case "Hard":
                case "khó":
                case "difficult":
                case "cao":
                    Console.WriteLine($"Row {row}: Mapping '{difficultyStr}' to Hard");
                    return DifficultyLevel.Hard;

                default:
                    Console.WriteLine($"Warning: Unrecognized DifficultyLevel '{difficultyStr}' in row {row}. Defaulting to Medium.");
                    return DifficultyLevel.Medium;
            }
        }
    }
}