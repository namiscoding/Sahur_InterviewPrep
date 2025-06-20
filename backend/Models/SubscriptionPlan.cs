using InterviewPrep.API.Models.Enums;

namespace InterviewPrep.API.Models
{
    public class SubscriptionPlan
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public SubscriptionPlanLevel Level { get; set; }
        public int DurationMonths { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public bool IsActive { get; set; }
        public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
