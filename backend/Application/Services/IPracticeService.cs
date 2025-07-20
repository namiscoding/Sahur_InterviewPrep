using InterviewPrep.API.Application.DTOs.MockSessions;
using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Application.Services
{
    public interface IPracticeService
    {
        Task<(MockSession? Session, string? ErrorMessage)> StartSingleQuestionPracticeAsync(long questionId);
        Task<(SubmitAnswerResponseDto? Result, string? ErrorMessage)> SubmitAnswerAndCompleteSingleQuestionAsync(long sessionId, string userAnswer);
        Task<(MockSession? Session, string? ErrorMessage)> StartFullMockInterviewAsync(CreateFullInterviewRequestDto request);
        Task<(SessionAnswer? Answer, string? ErrorMessage)> SubmitAnswerForMockInterviewAsync(long sessionId, SubmitFullInterviewAnswerRequestDto request);
        Task<(MockSession? Session, string? ErrorMessage)> CompleteFullMockInterviewAsync(long sessionId);
        Task<MockSession?> GetSessionByIdAsync(long sessionId);
    }
}
