using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Application.Services
{
    public interface ISubscriptionService
    {
        Task<bool> UpgradeUserSubscriptionAsync(string userId, int subscriptionPlanId, string transactionId);
        Task<SubscriptionPlan?> GetSubscriptionPlanAsync(int planId);
        Task<List<SubscriptionPlan>> GetActiveSubscriptionPlansAsync();
    }
}
