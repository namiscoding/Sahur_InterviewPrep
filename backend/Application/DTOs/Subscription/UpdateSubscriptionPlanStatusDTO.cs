using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.Subscription
{
    public class UpdateSubscriptionPlanStatusDTO
    {
        [Required]
        public bool IsActive { get; set; }
    }
}
