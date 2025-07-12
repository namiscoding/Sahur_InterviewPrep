using InterviewPrep.API.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Data.Repositories
{
    public class QuestionRepository : IQuestionRepository
    {
        private readonly ApplicationDbContext _context;

        public QuestionRepository(ApplicationDbContext context)
        {
            _context = context;
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
        public async Task<Question> AddQuestionAsync(Question question, List<int>? categoryIds, List<int>? tagIds)
        {
            
            question.UsageCount = 0;

            await _context.Questions.AddAsync(question);

            
            if (categoryIds != null && categoryIds.Any())
            {
                var existingCategories = await _context.Categories
                                                       .Where(c => categoryIds.Contains(c.Id))
                                                       .ToListAsync();
                foreach (var category in existingCategories)
                {
                    question.QuestionCategories.Add(new QuestionCategory { Category = category });
                }
            }

            if (tagIds != null && tagIds.Any())
            {
                
                var existingTags = await _context.Tags
                                                 .Where(t => tagIds.Contains(t.Id))
                                                 .ToListAsync();
                foreach (var tag in existingTags)
                {
                    question.QuestionTags.Add(new QuestionTag { Tag = tag });
                }
            }

            await _context.SaveChangesAsync();
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

       
        public async Task<Question> UpdateQuestionAsync(Question question, List<int>? categoryIds, List<int>? tagIds)
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

            if (tagIds != null && tagIds.Any())
            {
                var tagsToAdd = await _context.Tags
                                              .Where(t => tagIds.Contains(t.Id))
                                              .ToListAsync();
                foreach (var tag in tagsToAdd)
                {
                    question.QuestionTags.Add(new QuestionTag { Question = question, Tag = tag });
                }
            }

            await _context.SaveChangesAsync();
            return question;
        }
        public IQueryable<Question> GetActiveQuestionsQuery()
        {
            return _context.Questions.Where(q => q.IsActive).AsQueryable();
        }

        public async Task<Question?> GetActiveQuestionByIdAsync(long id)
        {
            return await _context.Questions
                .Include(q => q.QuestionCategories).ThenInclude(qc => qc.Category)
                .Include(q => q.QuestionTags).ThenInclude(qt => qt.Tag)
                .FirstOrDefaultAsync(q => q.Id == id && q.IsActive);
        }
    }
}
