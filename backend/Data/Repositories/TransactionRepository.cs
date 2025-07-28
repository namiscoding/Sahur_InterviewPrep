using InterviewPrep.API.Application.DTOs.Transaction;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly ApplicationDbContext _context;

        public TransactionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<Transaction> Transactions, int Total)> GetAllTransactionsAsync(TransactionFilterDTO filter)
        {
            var query = _context.Transactions
                .Include(t => t.User)
                .Include(t => t.SubscriptionPlan)
                .AsQueryable();

            if (filter.FromDate.HasValue)
                query = query.Where(t => t.TransactionDate >= filter.FromDate.Value);

            if (filter.ToDate.HasValue)
                query = query.Where(t => t.TransactionDate <= filter.ToDate.Value);

            if (!string.IsNullOrEmpty(filter.Status) && Enum.TryParse<TransactionStatus>(filter.Status, true, out var parsedStatus))
                query = query.Where(t => t.Status == parsedStatus);

            if (!string.IsNullOrEmpty(filter.Search))
                query = query.Where(t =>
                    t.TransactionCode.Contains(filter.Search) ||
                    (t.GatewayTransactionId ?? "").Contains(filter.Search) ||
                    (t.ExternalTransactionId ?? "").Contains(filter.Search));

            if (!string.IsNullOrEmpty(filter.CustomerSearch))
                query = query.Where(t =>
                    t.User.DisplayName.Contains(filter.CustomerSearch) ||
                    t.User.Email.Contains(filter.CustomerSearch));

            var total = await query.CountAsync();

            var transactions = await query
                .OrderByDescending(t => t.TransactionDate)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (transactions, total);
        }

        public async Task<Transaction> GetTransactionByIdAsync(long id)
        {
            return await _context.Transactions
                .Include(t => t.User)
                .Include(t => t.SubscriptionPlan)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<TransactionStatisticsDTO> GetTransactionStatisticsAsync(TransactionFilterDTO filter)
        {
            var query = _context.Transactions.AsQueryable();

            // Apply filters
            if (filter.FromDate.HasValue)
                query = query.Where(t => t.TransactionDate >= filter.FromDate.Value);

            if (filter.ToDate.HasValue)
                query = query.Where(t => t.TransactionDate <= filter.ToDate.Value);

            if (!string.IsNullOrEmpty(filter.Status) && Enum.TryParse<TransactionStatus>(filter.Status, true, out var parsedStatus))
                query = query.Where(t => t.Status == parsedStatus);

            if (!string.IsNullOrEmpty(filter.Search))
                query = query.Where(t =>
                    t.TransactionCode.Contains(filter.Search) ||
                    (t.GatewayTransactionId ?? "").Contains(filter.Search) ||
                    (t.ExternalTransactionId ?? "").Contains(filter.Search));

            if (!string.IsNullOrEmpty(filter.CustomerSearch))
                query = query.Where(t =>
                    t.User.DisplayName.Contains(filter.CustomerSearch) ||
                    t.User.Email.Contains(filter.CustomerSearch));

            // Get statistics
            var totalTransactions = await query.CountAsync();
            var completedTransactions = await query.CountAsync(t => t.Status == TransactionStatus.Completed);
            var pendingTransactions = await query.CountAsync(t => t.Status == TransactionStatus.Pending);
            var failedTransactions = await query.CountAsync(t => t.Status == TransactionStatus.Failed);
            var cancelledTransactions = await query.CountAsync(t => t.Status == TransactionStatus.Cancelled);

            var totalRevenue = await query.SumAsync(t => t.Amount);
            var completedRevenue = await query.Where(t => t.Status == TransactionStatus.Completed).SumAsync(t => t.Amount);

            var successRate = totalTransactions > 0 ? (double)completedTransactions / totalTransactions * 100 : 0;

            var lastTransactionDate = await query.MaxAsync(t => (DateTime?)t.TransactionDate);
            var firstTransactionDate = await query.MinAsync(t => (DateTime?)t.TransactionDate);

            // Get revenue by currency
            var revenueByCurrency = await query
                .Where(t => t.Status == TransactionStatus.Completed)
                .GroupBy(t => t.Currency)
                .Select(g => new RevenueByCurrencyDTO
                {
                    Currency = g.Key,
                    TotalAmount = g.Sum(t => t.Amount),
                    TransactionCount = g.Count()
                })
                .ToListAsync();

            return new TransactionStatisticsDTO
            {
                TotalTransactions = totalTransactions,
                CompletedTransactions = completedTransactions,
                PendingTransactions = pendingTransactions,
                FailedTransactions = failedTransactions,
                CancelledTransactions = cancelledTransactions,
                TotalRevenue = totalRevenue,
                CompletedRevenue = completedRevenue,
                SuccessRate = successRate,
                RevenueByCurrency = revenueByCurrency,
                LastTransactionDate = lastTransactionDate,
                FirstTransactionDate = firstTransactionDate
            };
        }
    }
}
