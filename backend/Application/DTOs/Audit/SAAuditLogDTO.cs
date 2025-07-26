namespace InterviewPrep.API.Application.DTOs.Audit
{
    public class SAAuditLogDTO
    {
        public long Id { get; set; }
        public string? UserId { get; set; }
        public string? UserName { get; set; } 
        public string? UserRole { get; set; } 
        public string ActionDescription { get; set; } 
        public string Area { get; set; } = "Unknown"; 
        public string ActionType { get; set; } = "Unknown"; 
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
