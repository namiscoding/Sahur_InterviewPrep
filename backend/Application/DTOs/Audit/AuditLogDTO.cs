namespace InterviewPrep.API.Application.DTOs.Audit
{
    public class AuditLogDTO
    {
        public long Id { get; set; }
        public string? UserId { get; set; }
        public string Action { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? UserEmail { get; set; } // Populated in service for display
    }
}