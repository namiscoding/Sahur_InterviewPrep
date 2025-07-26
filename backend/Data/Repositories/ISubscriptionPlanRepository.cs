using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Data.Repositories
{
    public interface ISubscriptionPlanRepository
    {
        Task<IEnumerable<SubscriptionPlan>> GetAllSubscriptionPlansAsync();
        Task<SubscriptionPlan?> GetSubscriptionPlanByIdAsync(int id);
        Task<SubscriptionPlan> UpdateSubscriptionPlanAsync(SubscriptionPlan plan);
    }
}
