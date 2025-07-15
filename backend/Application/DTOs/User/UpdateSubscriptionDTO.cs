using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.User
{
    public class UpdateSubscriptionDTO
    {
        [Required]
        public string SubscriptionLevel { get; set; } // "Free", "Premium" (from enum strings)

        [Required]
        public string Reason { get; set; }
    }
}