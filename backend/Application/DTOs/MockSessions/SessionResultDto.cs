using InterviewPrep.API.Application.DTOs.Question;

namespace InterviewPrep.API.Application.DTOs.MockSessions
{
    public class SessionAnswerResultDto
    {
        public QuestionForCustomerDto Question { get; set; }
        public string? UserAnswer { get; set; }
        public decimal? Score { get; set; }
        public FeedbackDto? Feedback { get; set; }
    }

    public class SessionResultDto
    {
        public long Id { get; set; }
        public string Status { get; set; }
        public string SessionType { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public decimal? OverallScore { get; set; }
        public List<SessionAnswerResultDto> Answers { get; set; }
    }
}
