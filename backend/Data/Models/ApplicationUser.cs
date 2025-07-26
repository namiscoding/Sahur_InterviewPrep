using InterviewPrep.API.Data.Models.Enums;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Data.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string DisplayName { get; set; }

        public UserStatus Status { get; set; } = UserStatus.Active;

        public SubscriptionLevel SubscriptionLevel { get; set; } = SubscriptionLevel.Free;

        public DateTime? SubscriptionExpiryDate { get; set; }
    
        public virtual ICollection<Category> CreatedCategories { get; set; } = new List<Category>();
        public virtual ICollection<Question> CreatedQuestions { get; set; } = new List<Question>();
        public virtual ICollection<MockSession> MockSessions { get; set; } = new List<MockSession>();
        public virtual ICollection<UsageLog> UsageLogs { get; set; } = new List<UsageLog>();
        public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
        public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    }
}
