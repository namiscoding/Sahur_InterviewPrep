namespace InterviewPrep.API.Models
{
    public class SessionAnswer
    {
        public long Id { get; set; }
        public long SessionId { get; set; }
        public long QuestionId { get; set; }
        public int QuestionOrder { get; set; }
        public string? UserAnswer { get; set; }
        public decimal? Score { get; set; }
        public string? Feedback { get; set; }
        public DateTime? AnsweredAt { get; set; }
        public virtual MockSession MockSession { get; set; }
        public virtual Question Question { get; set; }
    }
}
