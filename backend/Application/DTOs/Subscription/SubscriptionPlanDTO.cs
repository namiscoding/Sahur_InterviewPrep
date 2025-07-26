using InterviewPrep.API.Data.Models.Enums;

namespace InterviewPrep.API.Application.DTOs.Subscription
{
    public class SubscriptionPlanDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public SubscriptionPlanLevel Level { get; set; }
        public int DurationMonths { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public bool IsActive { get; set; }
    }
}
