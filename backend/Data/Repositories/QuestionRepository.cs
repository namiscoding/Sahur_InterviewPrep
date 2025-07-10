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
    }
}
