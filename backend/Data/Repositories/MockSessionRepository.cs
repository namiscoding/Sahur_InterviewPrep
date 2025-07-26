using InterviewPrep.API.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Data.Repositories
{
    public class MockSessionRepository : IMockSessionRepository
    {
        private readonly ApplicationDbContext _context;

        public MockSessionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<MockSession>> GetSessionsByUserIdAsync(string userId)
        {
            return await _context.MockSessions
                .Where(x => x.UserId == userId)
                .Include(x => x.SessionAnswers)
                .OrderByDescending(x => x.StartedAt)
                .ToListAsync();
        }
    }
}