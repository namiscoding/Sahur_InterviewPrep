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

            if (filter.PlanId.HasValue)
                query = query.Where(t => t.SubscriptionPlanId == filter.PlanId.Value);

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
    }
}
