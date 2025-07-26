using InterviewPrep.API.Application.DTOs.MockSessions;

namespace InterviewPrep.API.Application.Services
{
    public interface IAiService
    {
        Task<(FeedbackDto Feedback, int Score)> GetFeedbackForAnswerAsync(string question, string userAnswer);
    }
}
