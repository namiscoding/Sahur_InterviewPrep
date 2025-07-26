namespace InterviewPrep.API.Application.DTOs.MockSessions
{
    public class SubmitAnswerResponseDto
    {
        public long SessionAnswerId { get; set; }
        public decimal Score { get; set; }
        public FeedbackDto Feedback { get; set; }
    }
}
