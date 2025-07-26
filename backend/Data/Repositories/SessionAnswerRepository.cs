using InterviewPrep.API.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Data.Repositories
{
    public class SessionAnswerRepository : ISessionAnswerRepository
    {
        private readonly ApplicationDbContext _context;

        public SessionAnswerRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SessionAnswer>> GetAnswersBySessionIdAsync(long sessionId)
        {
            return await _context.SessionAnswers
                .Include(sa => sa.Question)
                .Where(sa => sa.SessionId == sessionId)
                .OrderBy(sa => sa.QuestionOrder)
                .ToListAsync();
        }
    }

}
