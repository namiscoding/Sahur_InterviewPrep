using Microsoft.EntityFrameworkCore;
using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Application.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<TransactionService> _logger;

        public TransactionService(ApplicationDbContext dbContext, ILogger<TransactionService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> LogTransactionAsync(Transaction transaction)
        {
            try
            {
                if (transaction == null)
                {
                    _logger.LogError("Transaction object is null.");
                    return false;
                }

                // Check if transaction with same external ID already exists (for idempotency)
                if (!string.IsNullOrEmpty(transaction.ExternalTransactionId))
                {
                    var existingTransaction = await GetTransactionByExternalIdAsync(transaction.ExternalTransactionId);
                    if (existingTransaction != null)
                    {
                        _logger.LogInformation("Transaction with external ID {ExternalId} already exists. Skipping.", transaction.ExternalTransactionId);
                        return true; // Consider it successful since it already exists
                    }
                }

                _dbContext.Transactions.Add(transaction);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Successfully logged transaction for user {UserId}, plan {PlanId}, amount {Amount}, status {Status}",
                    transaction.UserId, transaction.SubscriptionPlanId, transaction.Amount, transaction.Status);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging transaction for user {UserId}, plan {PlanId}",
                    transaction?.UserId, transaction?.SubscriptionPlanId);
                return false;
            }
        }

        public async Task<List<Transaction>> GetUserTransactionsAsync(string userId)
        {
            try
            {
                return await _dbContext.Transactions
                    .Where(t => t.UserId == userId)
                    .OrderByDescending(t => t.TransactionDate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transactions for user {UserId}", userId);
                return new List<Transaction>();
            }
        }

        public async Task<Transaction?> GetTransactionByExternalIdAsync(string externalTransactionId)
        {
            try
            {
                if (string.IsNullOrEmpty(externalTransactionId))
                    return null;

                return await _dbContext.Transactions
                    .FirstOrDefaultAsync(t => t.ExternalTransactionId == externalTransactionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving transaction by external ID {ExternalId}", externalTransactionId);
                return null;
            }
        }
    }
}
