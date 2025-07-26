using InterviewPrep.API.Data.Models.Enums;

namespace InterviewPrep.API.Application.DTOs
{
    public class SubscriptionStatusDto
    {
        public string PlanName { get; set; }
        public SubscriptionLevel Level { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool IsExpired => ExpiryDate.HasValue && ExpiryDate.Value < DateTime.UtcNow;
    }

}
