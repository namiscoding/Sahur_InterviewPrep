using InterviewPrep.API.Data.Models.Enums;

namespace InterviewPrep.API.Application.DTOs.Subscription
{
    public class UpgradeSuccessResponseDTO
    {
        public string Message { get; set; }
        public SubscriptionLevel NewSubscriptionLevel { get; set; }
        public DateTime SubscriptionExpiryDate { get; set; }
        public string TransactionId { get; set; }
    }
}
