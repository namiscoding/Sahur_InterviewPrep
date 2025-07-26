using InterviewPrep.API.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Application.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<SubscriptionService> _logger;

        public SubscriptionService(ApplicationDbContext dbContext, ILogger<SubscriptionService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> UpgradeUserSubscriptionAsync(string userId, int subscriptionPlanId, string transactionId)
        {
            try
            {
                var user = await _dbContext.Users.FindAsync(userId);
                if (user == null)
                {
                    _logger.LogError("User {UserId} not found during subscription upgrade.", userId);
                    return false;
                }

                var subscriptionPlan = await _dbContext.SubscriptionPlans.FindAsync(subscriptionPlanId);
                if (subscriptionPlan == null)
                {
                    _logger.LogError("Subscription Plan {PlanId} not found during upgrade.", subscriptionPlanId);
                    return false;
                }

                // Check if user is already at or above this level
                if ((int)user.SubscriptionLevel >= (int)subscriptionPlan.Level)
                {
                    _logger.LogWarning("User {UserId} is already at or above subscription level {Level}.", userId, subscriptionPlan.Level);
                    return false;
                }

                // Calculate new expiry date
                DateTime newExpiryDate;
                if (user.SubscriptionExpiryDate.HasValue && user.SubscriptionExpiryDate > DateTime.UtcNow)
                {
                    // Extend from current expiry date
                    newExpiryDate = user.SubscriptionExpiryDate.Value.AddMonths(subscriptionPlan.DurationMonths);
                }
                else
                {
                    // Start from now
                    newExpiryDate = DateTime.UtcNow.AddMonths(subscriptionPlan.DurationMonths);
                }

                // Update user subscription
                // Update user subscription
                user.SubscriptionLevel = (InterviewPrep.API.Data.Models.Enums.SubscriptionLevel)(int)subscriptionPlan.Level;
                user.SubscriptionExpiryDate = newExpiryDate;

                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Successfully upgraded user {UserId} to subscription level {Level} with expiry {ExpiryDate}. Transaction: {TransactionId}",
                    userId, subscriptionPlan.Level, newExpiryDate, transactionId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error upgrading user {UserId} subscription to plan {PlanId}. Transaction: {TransactionId}",
                    userId, subscriptionPlanId, transactionId);
                return false;
            }
        }

        public async Task<SubscriptionPlan?> GetSubscriptionPlanAsync(int planId)
        {
            return await _dbContext.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Id == planId && p.IsActive);
        }

        public async Task<List<SubscriptionPlan>> GetActiveSubscriptionPlansAsync()
        {
            return await _dbContext.SubscriptionPlans
                .Where(p => p.IsActive)
                .OrderBy(p => p.Level)
                .ToListAsync();
        }
    }
}
