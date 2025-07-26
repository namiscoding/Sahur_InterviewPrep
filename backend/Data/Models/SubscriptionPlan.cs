using InterviewPrep.API.Data.Models.Enums;

namespace InterviewPrep.API.Data.Models
{
    public class SubscriptionPlan
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public SubscriptionLevel Level { get; set; }
        public int DurationMonths { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public bool IsActive { get; set; }
        public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}
