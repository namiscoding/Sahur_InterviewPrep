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

        public async Task<IEnumerable<Question>> GetQuestionsForAnalyticsAsync(
            List<int>? categoryIds,
            DateTime? startDate,
            DateTime? endDate,
            bool orderByUsageDescending,
            int? topN)
        {
            var query = _context.Questions
                                .Include(q => q.QuestionCategories)
                                    .ThenInclude(qc => qc.Category)
                                .Include(q => q.SessionAnswers) // Bao gồm SessionAnswers để tính UsageCount
                                .AsQueryable();

            // Lọc theo Category ID
            if (categoryIds != null && categoryIds.Any())
            {
                query = query.Where(q => q.QuestionCategories.Any(qc => categoryIds.Contains(qc.CategoryId)));
            }

            // Lọc theo khoảng thời gian trả lời (AnsweredAt) của SessionAnswer
            if (startDate.HasValue)
            {
                query = query.Where(q => q.SessionAnswers.Any(sa => sa.AnsweredAt >= startDate.Value));
            }
            if (endDate.HasValue)
            {
                // Lọc đến cuối ngày của endDate
                query = query.Where(q => q.SessionAnswers.Any(sa => sa.AnsweredAt <= endDate.Value.AddDays(1).AddTicks(-1)));
            }

            // Ánh xạ sang một dạng ẩn danh để tính UsageCount và sắp xếp
            var questionsWithUsage = query.Select(q => new
            {
                Question = q,
                CalculatedUsageCount = q.SessionAnswers
                                        .Where(sa => (!startDate.HasValue || sa.AnsweredAt >= startDate.Value) &&
                                                     (!endDate.HasValue || sa.AnsweredAt <= endDate.Value.AddDays(1).AddTicks(-1)))
                                        .Count()
            });

            // Sắp xếp theo CalculatedUsageCount
            if (orderByUsageDescending)
            {
                questionsWithUsage = questionsWithUsage.OrderByDescending(x => x.CalculatedUsageCount);
            }
            else
            {
                questionsWithUsage = questionsWithUsage.OrderBy(x => x.CalculatedUsageCount);
            }

            // Lọc Top N
            if (topN.HasValue && topN.Value > 0)
            {
                questionsWithUsage = questionsWithUsage.Take(topN.Value);
            }

            // Lấy lại các đối tượng Question đầy đủ
            return await questionsWithUsage.Select(x => x.Question).ToListAsync();
        }

        // Cập nhật: GetCategoryUsageTrendsAsync - tính TotalUsageCount từ SessionAnswer
        public async Task<IEnumerable<CategoryUsageTrend>> GetCategoryUsageTrendsAsync(
            List<int>? categoryIds,
            DateTime? startDate,
            DateTime? endDate,
            string timeUnit = "month")
        {
            var query = _context.SessionAnswers
                                .Include(sa => sa.Question)
                                    .ThenInclude(q => q.QuestionCategories)
                                        .ThenInclude(qc => qc.Category)
                                .AsQueryable();

            // Lọc theo khoảng thời gian trả lời (AnsweredAt)
            if (startDate.HasValue)
            {
                query = query.Where(sa => sa.AnsweredAt >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                query = query.Where(sa => sa.AnsweredAt <= endDate.Value.AddDays(1).AddTicks(-1));
            }

            // Lọc theo Category ID của câu hỏi trong session answer
            if (categoryIds != null && categoryIds.Any())
            {
                query = query.Where(sa => sa.Question.QuestionCategories.Any(qc => categoryIds.Contains(qc.CategoryId)));
            }

            // Thực hiện Grouping và Aggregation
            var trends = await query
                .SelectMany(sa => sa.Question.QuestionCategories, (sa, qc) => new { SessionAnswer = sa, Category = qc.Category })
                .Where(x => x.Category != null) // Đảm bảo Category không null
                .GroupBy(x => new
                {
                    CategoryId = x.Category!.Id,
                    CategoryName = x.Category!.Name,
                    Period = timeUnit.ToLower() == "year" ?
                                (x.SessionAnswer.AnsweredAt.HasValue ? x.SessionAnswer.AnsweredAt.Value.Year.ToString() : "Unknown Year") :
                             timeUnit.ToLower() == "quarter" ?
                                (x.SessionAnswer.AnsweredAt.HasValue ? $"{x.SessionAnswer.AnsweredAt.Value.Year}-Q{(x.SessionAnswer.AnsweredAt.Value.Month - 1) / 3 + 1}" : "Unknown Quarter") :
                                (x.SessionAnswer.AnsweredAt.HasValue ? $"{x.SessionAnswer.AnsweredAt.Value.Year}-{x.SessionAnswer.AnsweredAt.Value.Month:D2}" : "Unknown Month")
                })
                .Select(g => new CategoryUsageTrend
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.CategoryName,
                    Period = g.Key.Period,
                    TotalUsageCount = g.Count(), // Tổng số SessionAnswer trong nhóm
                    NumberOfQuestions = g.Select(x => x.SessionAnswer.QuestionId).Distinct().Count() // Số câu hỏi duy nhất đã được trả lời
                })
                .OrderBy(t => t.Period) // Sắp xếp theo thời gian
                .ThenBy(t => t.CategoryName) // Sau đó theo tên Category
                .ToListAsync();

            return trends;
        }
    }
}
