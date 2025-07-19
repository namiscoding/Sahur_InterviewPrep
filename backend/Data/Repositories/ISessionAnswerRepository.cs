using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Data.Repositories
{
    public interface ISessionAnswerRepository
    {
        Task<IEnumerable<SessionAnswer>> GetAnswersBySessionIdAsync(long sessionId);
    }
}
