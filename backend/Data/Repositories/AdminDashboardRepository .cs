    using System.Transactions;
    using InterviewPrep.API.Application.DTOs.Staff;
    using InterviewPrep.API.Data.Models.Enums;
    using Microsoft.EntityFrameworkCore;

    namespace InterviewPrep.API.Data.Repositories
    {
        public class AdminDashboardRepository : IAdminDashboardRepository
        {
            private readonly ApplicationDbContext _context;

            public AdminDashboardRepository(ApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<int> GetTotalUsersAsync()
            {
                return await _context.Users.CountAsync();
            }

            public async Task<int> GetActiveUsersAsync()
            {
                return await _context.Users.Where(u => u.Status == UserStatus.Active)
                    .CountAsync();
            }

            public async Task<decimal> GetTotalRevenueAsync()
            {
                return await _context.Transactions
                    .Where(t => t.Status == Models.Enums.TransactionStatus.Completed)
                    .SumAsync(t => t.Amount);
            }

            public async Task<decimal> GetMonthlyRevenueAsync()
            {
                var now = DateTime.UtcNow;
                return await _context.Transactions
                    .Where(t => t.Status == Models.Enums.TransactionStatus.Completed &&
                                t.CreatedAt.Year == now.Year && t.CreatedAt.Month == now.Month)
                    .SumAsync(t => t.Amount);
            }

            public async Task<int> GetTotalSessionsAsync()
            {
                return await _context.MockSessions.CountAsync();
            }

            public async Task<int> GetActiveSessionsAsync()
            {
                return await _context.MockSessions.CountAsync(s => s.Status == SessionStatus.Completed);
            }

 

            public async Task<double> GetRevenueGrowthRateAsync()
            {
                var now = DateTime.UtcNow;

                var thisMonth = await _context.Transactions
                    .Where(t => t.Status == Models.Enums.TransactionStatus.Completed &&
                                t.CreatedAt.Month == now.Month && t.CreatedAt.Year == now.Year)
                    .SumAsync(t => t.Amount);

                var lastMonth = await _context.Transactions
                    .Where(t => t.Status == Models.Enums.TransactionStatus.Completed &&
                                t.CreatedAt.Month == now.AddMonths(-1).Month && t.CreatedAt.Year == now.AddMonths(-1).Year)
                    .SumAsync(t => t.Amount);

                if (lastMonth == 0) return 100.0;
                return (double)((thisMonth - lastMonth) / lastMonth) * 100.0;
            }

            public async Task<List<MonthlyRevenue>> GetRevenuePerMonthAsync(int monthsBack)
            {
                var now = DateTime.UtcNow;
                var fromDate = now.AddMonths(-monthsBack);

                var revenues = await _context.Transactions
                    .Where(t => t.Status == Models.Enums.TransactionStatus.Completed && t.CreatedAt >= fromDate)
                    .GroupBy(t => new { t.CreatedAt.Year, t.CreatedAt.Month })
                    .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                    .Select(g => new MonthlyRevenue
                    {
                        Month = $"{g.Key.Month:D2}/{g.Key.Year}",
                        Amount = g.Sum(x => x.Amount)
                    })
                    .ToListAsync();

                return revenues;
            }



        }

    }
