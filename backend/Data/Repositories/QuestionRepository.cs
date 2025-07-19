using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Data.Repositories
{
    public class QuestionRepository : IQuestionRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ITagRepository _tagRepository;
        private readonly IAuditLogService _auditLogService; 

        public QuestionRepository(ApplicationDbContext context, ITagRepository tagRepository, IAuditLogService auditLogService)
        {
            _context = context;
            _tagRepository = tagRepository;
            _auditLogService = auditLogService;
        }
        public async Task<IEnumerable<Question>> GetAllQuestionsAsync()
        {
            return await _context.Questions.ToListAsync();
        }

        public async Task<IEnumerable<Question>> GetActiveQuestionsAsync()
        {
            return await _context.Questions
                .Where(q => q.IsActive)
                .Include(q => q.QuestionCategories)
                    .ThenInclude(qc => qc.Category)
                .Include(q => q.QuestionTags)
                    .ThenInclude(qt => qt.Tag)
                .ToListAsync();
        }

        public async Task<IEnumerable<Question>> SearchQuestionsAsync(string? quesContent, bool? isActive, int? quesDifficultyLevel)
        {
            var query = _context.Questions.AsQueryable();

            if (quesDifficultyLevel.HasValue && quesDifficultyLevel > 0)
            {
                query = query.Where(q => (int)q.DifficultyLevel == quesDifficultyLevel.Value);
            }

            if (isActive.HasValue)
            {
                query = query.Where(q => q.IsActive == isActive.Value);
            }

            if (!string.IsNullOrEmpty(quesContent))
            {
                query = query.Where(q => q.Content.Contains(quesContent));
            }

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<Question>> GetQuestionsSortedByUsageCountAsync(bool descending = true)
        {
            var query = _context.Questions.AsQueryable();

            if (descending)
            {
                query = query.OrderByDescending(q => q.UsageCount);
            }
            else
            {
                query = query.OrderBy(q => q.UsageCount);
            }

            return await query.ToListAsync();
        }
        public async Task<Question> AddQuestionAsync(Question question, List<int>? categoryIds, List<string>? tagNames, string userId)
        {
            question.UsageCount = 0;
            question.CreatedBy = userId;
            await _context.Questions.AddAsync(question);

           
            if (categoryIds != null && categoryIds.Any())
            {
                var existingCategories = await _context.Categories
                                                       .Where(c => categoryIds.Contains(c.Id))
                                                       .ToListAsync();
                foreach (var category in existingCategories)
                {
                    question.QuestionCategories.Add(new QuestionCategory { Category = category, Question = question });
                }
            }

            
            if (tagNames != null && tagNames.Any())
            {
                foreach (var tagName in tagNames)
                {
                    var tag = await _tagRepository.GetTagByNameAsync(tagName);
                    if (tag == null)
                    {
                        tag = new Tag { Name = tagName, Slug = tagName.ToLower().Replace(" ", "-") }; 
                        await _tagRepository.AddTagAsync(tag);
                    }
                    question.QuestionTags.Add(new QuestionTag { Tag = tag, Question = question });
                }
            }

            await _context.SaveChangesAsync();
            await _auditLogService.LogQuestionActionAsync(userId, "Added", question.Id, question.Content, null);
            return question;
        }

        public async Task<Question?> GetQuestionByIdAsync(long id)
        {
            return await _context.Questions
                                 .Include(q => q.QuestionCategories)
                                     .ThenInclude(qc => qc.Category)
                                 .Include(q => q.QuestionTags)
                                     .ThenInclude(qt => qt.Tag)
                                 .FirstOrDefaultAsync(q => q.Id == id);
        }


        public async Task<Question> UpdateQuestionAsync(Question question, List<int>? categoryIds, List<string>? tagNames, string userId)
        {

            _context.Questions.Update(question);
            var existingQuestionCategories = await _context.QuestionCategories
                                                          .Where(qc => qc.QuestionId == question.Id)
                                                          .ToListAsync();
            _context.QuestionCategories.RemoveRange(existingQuestionCategories);

            if (categoryIds != null && categoryIds.Any())
            {
                var categoriesToAdd = await _context.Categories
                                                    .Where(c => categoryIds.Contains(c.Id))
                                                    .ToListAsync();
                foreach (var category in categoriesToAdd)
                {
                    question.QuestionCategories.Add(new QuestionCategory { Question = question, Category = category });
                }
            }

            var existingQuestionTags = await _context.QuestionTags
                                                    .Where(qt => qt.QuestionId == question.Id)
                                                    .ToListAsync();
            _context.QuestionTags.RemoveRange(existingQuestionTags); 

            if (tagNames != null && tagNames.Any())
            {
                foreach (var tagName in tagNames)
                {
                    var tag = await _tagRepository.GetTagByNameAsync(tagName);
                    if (tag == null)
                    {
                        tag = new Tag { Name = tagName, Slug = tagName.ToLower().Replace(" ", "-") };
                        await _tagRepository.AddTagAsync(tag);
                    }
                    question.QuestionTags.Add(new QuestionTag { Question = question, Tag = tag });
                }
            }

            await _context.SaveChangesAsync();
            await _auditLogService.LogQuestionActionAsync(userId, "Updated", question.Id, question.Content, null);
            return question;
        }
        public IQueryable<Question> GetActiveQuestionsQuery()
        {
            return _context.Questions.Where(q => q.IsActive).AsQueryable();
        }

        public async Task<IEnumerable<CategoryUsageTrend>> GetCategoryUsageTrendsAsync(
    List<int>? categoryIds,
    DateTime? startDate,
    DateTime? endDate,
    string timeUnit = "month")
        {
            try
            {
                // First, let's check if we have any SessionAnswers data
                var sessionAnswersQuery = _context.SessionAnswers.AsQueryable();

                // Apply date filters first
                if (startDate.HasValue)
                {
                    sessionAnswersQuery = sessionAnswersQuery.Where(sa => sa.AnsweredAt >= startDate.Value);
                }
                if (endDate.HasValue)
                {
                    sessionAnswersQuery = sessionAnswersQuery.Where(sa => sa.AnsweredAt <= endDate.Value.AddDays(1).AddTicks(-1));
                }

                // Include related entities
                var query = sessionAnswersQuery
                    .Include(sa => sa.Question)
                        .ThenInclude(q => q.QuestionCategories)
                            .ThenInclude(qc => qc.Category)
                    .Where(sa => sa.Question != null && sa.AnsweredAt.HasValue); // Ensure we have valid data

                // Apply category filter if provided
                if (categoryIds != null && categoryIds.Any())
                {
                    query = query.Where(sa => sa.Question.QuestionCategories.Any(qc => categoryIds.Contains(qc.CategoryId)));
                }

                // Get the data and then group it
                var sessionAnswers = await query.ToListAsync();

                // Group and aggregate in memory to avoid complex SQL generation
                var trends = sessionAnswers
                    .SelectMany(sa => sa.Question.QuestionCategories, (sa, qc) => new { SessionAnswer = sa, Category = qc.Category })
                    .Where(x => x.Category != null)
                    .GroupBy(x => new
                    {
                        CategoryId = x.Category.Id,
                        CategoryName = x.Category.Name,
                        Period = GetPeriodString(x.SessionAnswer.AnsweredAt.Value, timeUnit)
                    })
                    .Select(g => new CategoryUsageTrend
                    {
                        CategoryId = g.Key.CategoryId,
                        CategoryName = g.Key.CategoryName,
                        Period = g.Key.Period,
                        TotalUsageCount = g.Count(),
                        NumberOfQuestions = g.Select(x => x.SessionAnswer.QuestionId).Distinct().Count()
                    })
                    .OrderBy(t => t.Period)
                    .ThenBy(t => t.CategoryName)
                    .ToList();

                return trends;
            }
            catch (Exception ex)
            {
                // Log the exception for debugging
                Console.WriteLine($"Error in GetCategoryUsageTrendsAsync: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");

                // Return empty list instead of throwing
                return new List<CategoryUsageTrend>();
            }
        }

        public async Task<IEnumerable<Question>> GetQuestionsUsageRankingAsync(
            List<int>? categoryIds,
            DateTime? startDate,
            DateTime? endDate,
            bool orderByUsageDescending = true,
            int? topN = null)
        {
            var query = _context.Questions
                                .Include(q => q.QuestionCategories)
                                    .ThenInclude(qc => qc.Category)
                                .Include(q => q.SessionAnswers)
                                .AsQueryable();

            if (categoryIds != null && categoryIds.Any())
            {
                query = query.Where(q => q.QuestionCategories.Any(qc => categoryIds.Contains(qc.CategoryId)));
            }

            var questionsWithUsage = query.Select(q => new
            {
                Question = q,
                CalculatedUsageCount = q.SessionAnswers
                    .Where(sa => sa.AnsweredAt.HasValue &&
                               (!startDate.HasValue || sa.AnsweredAt >= startDate.Value) &&
                               (!endDate.HasValue || sa.AnsweredAt <= endDate.Value.AddDays(1).AddTicks(-1)))
                    .Count()
            });

            if (orderByUsageDescending)
            {
                questionsWithUsage = questionsWithUsage.OrderByDescending(x => x.CalculatedUsageCount).ThenBy(x => x.Question.Id); ;
            }
            else
            {
                questionsWithUsage = questionsWithUsage.OrderBy(x => x.CalculatedUsageCount).ThenBy(x => x.Question.Id); ;
            }

            if (topN.HasValue && topN.Value > 0)
            {
                questionsWithUsage = questionsWithUsage.Take(topN.Value);
            }

            var result = await questionsWithUsage.ToListAsync();

            foreach (var item in result)
            {
                item.Question.UsageCount = item.CalculatedUsageCount;
            }

            return result.Select(x => x.Question);
        }
        private static string GetPeriodString(DateTime date, string timeUnit)
        {
            return timeUnit.ToLower() switch
            {
                "year" => date.Year.ToString(),
                "quarter" => $"{date.Year}-Q{(date.Month - 1) / 3 + 1}",
                "month" => $"{date.Year}-{date.Month:D2}",
                "week" => $"{date.Year}-W{GetWeekOfYear(date)}",
                "day" => date.ToString("yyyy-MM-dd"),
                _ => $"{date.Year}-{date.Month:D2}"
            };
        }

        private static int GetWeekOfYear(DateTime date)
        {
            var culture = System.Globalization.CultureInfo.CurrentCulture;
            return culture.Calendar.GetWeekOfYear(date,
                culture.DateTimeFormat.CalendarWeekRule,
                culture.DateTimeFormat.FirstDayOfWeek);
        }
        public async Task<Question?> GetActiveQuestionByIdAsync(long id)
        {
            return await _context.Questions
                .Include(q => q.QuestionCategories).ThenInclude(qc => qc.Category)
                .Include(q => q.QuestionTags).ThenInclude(qt => qt.Tag)
                .FirstOrDefaultAsync(q => q.Id == id && q.IsActive);
        }

        public async Task<IEnumerable<Question>> GetQuestionsByCategoryIdAsync(int categoryId)
        {
            return await _context.Questions
                                 .Where(q => q.QuestionCategories.Any(qc => qc.CategoryId == categoryId))
                                 .ToListAsync();
        }

        public async Task UpdateQuestionsStatusAsync(List<long> questionIds, bool isActive)
        {
            if (questionIds == null || !questionIds.Any())
            {
                return;
            }

            var questionsToUpdate = await _context.Questions
                                                  .Where(q => questionIds.Contains(q.Id))
                                                  .ToListAsync();

            foreach (var question in questionsToUpdate)
            {
                question.IsActive = isActive;
            }

            await _context.SaveChangesAsync();
            
        }

    }
}
