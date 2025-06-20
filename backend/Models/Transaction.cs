using InterviewPrep.API.Models.Enums;

namespace InterviewPrep.API.Models
{
    public class Transaction
    {
        public long Id { get; set; }
        public string UserId { get; set; } 
        public virtual ApplicationUser User { get; set; } 
        public int PlanId { get; set; }
        public string TransactionCode { get; set; }
        public string? GatewayTransactionId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public TransactionStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public virtual SubscriptionPlan Plan { get; set; }
    }
}
