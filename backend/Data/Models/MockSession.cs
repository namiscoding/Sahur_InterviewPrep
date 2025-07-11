using InterviewPrep.API.Data.Models.Enums;

namespace InterviewPrep.API.Data.Models
{
    public class MockSession
    {
        public long Id { get; set; }
        public string UserId { get; set; } 
        public virtual ApplicationUser? User { get; set; }
        public SessionType SessionType { get; set; }
        public int NumberOfQuestions { get; set; }
        public SessionStatus Status { get; set; }
        public decimal? OverallScore { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public virtual ICollection<SessionAnswer> SessionAnswers { get; set; } = new List<SessionAnswer>();
    }
}
