using InterviewPrep.API.Application.DTOs.MockSession;

namespace InterviewPrep.API.Application.Services
{
    public interface ISessionAnswerService
    {
        Task<IEnumerable<SessionAnswerDTO>> GetAnswersBySessionIdAsync(long sessionId);
    }
}
