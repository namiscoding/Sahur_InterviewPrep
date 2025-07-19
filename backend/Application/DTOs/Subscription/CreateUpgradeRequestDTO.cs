using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.Subscription
{
    public class CreateUpgradeRequestDTO
    {
        [Required]
        public int SubscriptionPlanId { get; set; }
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
        public decimal Amount { get; set; }
        // Potentially add a return URL if different from default
    }
}
