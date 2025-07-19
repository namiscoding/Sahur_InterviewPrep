using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Data.Repositories
{
    public interface IMockSessionRepository
    {
        Task<List<MockSession>> GetSessionsByUserIdAsync(string userId);
    }
}
