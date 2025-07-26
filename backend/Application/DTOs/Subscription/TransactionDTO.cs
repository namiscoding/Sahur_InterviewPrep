namespace InterviewPrep.API.Application.DTOs.Subscription
{
    public class TransactionDTO
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int SubscriptionPlanId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Status { get; set; }
        public string PaymentMethod { get; set; }
        public string? ExternalTransactionId { get; set; }
        public string? Notes { get; set; }
    }
}
