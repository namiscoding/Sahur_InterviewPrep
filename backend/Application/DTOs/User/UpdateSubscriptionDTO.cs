using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.User
{
    public class UpdateSubscriptionDTO
    {
        [Required]
        public string SubscriptionLevel { get; set; } // "Basic", "Premium" (from enum strings)

        public DateTime? SubscriptionExpiryDate { get; set; } // Optional, set if needed
    }
}