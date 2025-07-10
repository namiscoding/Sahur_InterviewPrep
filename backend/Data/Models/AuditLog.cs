namespace InterviewPrep.API.Data.Models
{
    public class AuditLog
    {
        public long Id { get; set; }

        public string? UserId { get; set; } 
        public virtual ApplicationUser? User { get; set; } 
        public string Action { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
