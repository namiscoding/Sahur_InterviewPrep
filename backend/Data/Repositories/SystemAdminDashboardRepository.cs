using InterviewPrep.API.Data;
using InterviewPrep.API.Data.Models.Enums;
using InterviewPrep.API.Application.DTOs.SystemAdmin;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public class SystemAdminDashboardRepository : ISystemAdminDashboardRepository
    {
        private readonly ApplicationDbContext _context;

        public SystemAdminDashboardRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SystemAdminDashboardStatsDto> GetSystemAdminDashboardStatsAsync()
        {
            try
            {
                Console.WriteLine("[DEBUG] Starting SystemAdmin dashboard stats collection...");
                
                var totalTransactions = await GetTotalTransactionsAsync();
                Console.WriteLine($"[DEBUG] Total Transactions: {totalTransactions}");
                
                var completedTransactions = await GetCompletedTransactionsAsync();
                Console.WriteLine($"[DEBUG] Completed Transactions: {completedTransactions}");
                
                var pendingTransactions = await GetPendingTransactionsAsync();
                var failedTransactions = await GetFailedTransactionsAsync();
                var totalRevenue = await GetTotalRevenueAsync();
                var totalUserAdmins = await GetTotalUserAdminsAsync();
                Console.WriteLine($"[DEBUG] Total UserAdmins: {totalUserAdmins}");
                
                var activeUserAdmins = await GetActiveUserAdminsAsync();
                var totalUsageLimits = await GetTotalUsageLimitsAsync();
                var systemSettings = await GetSystemSettingsCountAsync();
                var transactionsToday = await GetTransactionsTodayAsync();
                var revenueToday = await GetRevenueTodayAsync();
                var avgTransactionValue = await GetAvgTransactionValueAsync();
                var revenueByCurrency = await GetRevenueByCurrencyAsync();

            return new SystemAdminDashboardStatsDto
            {
                TotalTransactions = totalTransactions,
                CompletedTransactions = completedTransactions,
                PendingTransactions = pendingTransactions,
                FailedTransactions = failedTransactions,
                TotalRevenue = totalRevenue,
                TotalUserAdmins = totalUserAdmins,
                ActiveUserAdmins = activeUserAdmins,
                TotalUsageLimits = totalUsageLimits,
                SystemSettings = systemSettings,
                TransactionsToday = transactionsToday,
                RevenueToday = revenueToday,
                AvgTransactionValue = avgTransactionValue,
                TransactionStatusDistribution = new TransactionStatusDistributionDto
                {
                    CompletedCount = completedTransactions,
                    PendingCount = pendingTransactions,
                    FailedCount = failedTransactions,
                    CompletedPercentage = totalTransactions > 0 ? (decimal)completedTransactions / totalTransactions * 100 : 0,
                    PendingPercentage = totalTransactions > 0 ? (decimal)pendingTransactions / totalTransactions * 100 : 0,
                    FailedPercentage = totalTransactions > 0 ? (decimal)failedTransactions / totalTransactions * 100 : 0
                },
                UserAdminStatusDistribution = new UserAdminStatusDistributionDto
                {
                    ActiveCount = activeUserAdmins,
                    InactiveCount = totalUserAdmins - activeUserAdmins,
                    ActivePercentage = totalUserAdmins > 0 ? (decimal)activeUserAdmins / totalUserAdmins * 100 : 0,
                    InactivePercentage = totalUserAdmins > 0 ? (decimal)(totalUserAdmins - activeUserAdmins) / totalUserAdmins * 100 : 0
                },
                RevenueByCurrency = revenueByCurrency
            };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] SystemAdmin dashboard stats error: {ex.Message}");
                Console.WriteLine($"[ERROR] Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<int> GetTotalTransactionsAsync()
        {
            var count = await _context.Transactions.AsNoTracking().CountAsync();
            Console.WriteLine($"[DEBUG] Total Transactions: {count}");
            return count;
        }

        public async Task<int> GetCompletedTransactionsAsync()
        {
            return await _context.Transactions.AsNoTracking()
                .Where(t => t.Status == TransactionStatus.Completed)
                .CountAsync();
        }

        public async Task<int> GetPendingTransactionsAsync()
        {
            return await _context.Transactions.AsNoTracking()
                .Where(t => t.Status == TransactionStatus.Pending)
                .CountAsync();
        }

        public async Task<int> GetFailedTransactionsAsync()
        {
            return await _context.Transactions.AsNoTracking()
                .Where(t => t.Status == TransactionStatus.Failed)
                .CountAsync();
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            return await _context.Transactions.AsNoTracking()
                .Where(t => t.Status == TransactionStatus.Completed)
                .SumAsync(t => t.Amount);
        }

        public async Task<int> GetTotalUserAdminsAsync()
        {
            var userAdminRole = await _context.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Name == "UserAdmin");
            if (userAdminRole == null) return 0;

            return await _context.UserRoles.AsNoTracking()
                .Where(ur => ur.RoleId == userAdminRole.Id)
                .CountAsync();
        }

        public async Task<int> GetActiveUserAdminsAsync()
        {
            var userAdminRole = await _context.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Name == "UserAdmin");
            if (userAdminRole == null) return 0;

            var userAdminIds = await _context.UserRoles.AsNoTracking()
                .Where(ur => ur.RoleId == userAdminRole.Id)
                .Select(ur => ur.UserId)
                .ToListAsync();

            return await _context.Users.AsNoTracking()
                .Where(u => userAdminIds.Contains(u.Id) && u.Status == UserStatus.Active)
                .CountAsync();
        }

        public async Task<int> GetTotalUsageLimitsAsync()
        {
            return await _context.SystemSettings.AsNoTracking()
                .Where(s => s.SettingKey.StartsWith("FREE_USER_"))
                .CountAsync();
        }

        public async Task<int> GetSystemSettingsCountAsync()
        {
            return await _context.SystemSettings.AsNoTracking().CountAsync();
        }

        public async Task<int> GetTransactionsTodayAsync()
        {
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            return await _context.Transactions.AsNoTracking()
                .Where(t => t.CreatedAt >= today && t.CreatedAt < tomorrow)
                .CountAsync();
        }

        public async Task<decimal> GetRevenueTodayAsync()
        {
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            return await _context.Transactions.AsNoTracking()
                .Where(t => t.Status == TransactionStatus.Completed && 
                           t.CreatedAt >= today && t.CreatedAt < tomorrow)
                .SumAsync(t => t.Amount);
        }

        public async Task<decimal> GetAvgTransactionValueAsync()
        {
            var completedTransactions = await _context.Transactions.AsNoTracking()
                .Where(t => t.Status == TransactionStatus.Completed)
                .ToListAsync();

            return completedTransactions.Any() ? completedTransactions.Average(t => t.Amount) : 0;
        }

        public async Task<List<RevenueByCurrencyDto>> GetRevenueByCurrencyAsync()
        {
            return await _context.Transactions.AsNoTracking()
                .Where(t => t.Status == TransactionStatus.Completed)
                .GroupBy(t => t.Currency)
                .Select(g => new RevenueByCurrencyDto
                {
                    Currency = g.Key,
                    Amount = g.Sum(t => t.Amount),
                    TransactionCount = g.Count()
                })
                .ToListAsync();
        }
    }
} 