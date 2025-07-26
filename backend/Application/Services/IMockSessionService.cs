using InterviewPrep.API.Application.DTOs.MockSession;
using InterviewPrep.API.Application.DTOs.User;

namespace InterviewPrep.API.Application.Services
{
    public interface IMockSessionService
    {
        Task<List<DTOs.MockSession.MockSessionDTO>> GetUserSessionsAsync(string userId);
    }
}