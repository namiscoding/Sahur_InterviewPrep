namespace InterviewPrep.API.Models
{
    public class UsageLog
    {
        public long Id { get; set; }
        public string UserId { get; set; } 
        public virtual ApplicationUser User { get; set; } 
        public string ActionType { get; set; }
        public DateTime UsageTimestamp { get; set; }
    }
}
