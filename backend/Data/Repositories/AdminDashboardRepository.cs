using InterviewPrep.API.Data;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;
using InterviewPrep.API.Application.DTOs.Admin;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public class UserAdminDashboardRepository : IUserAdminDashboardRepository
    {
        private readonly ApplicationDbContext _context;

        public UserAdminDashboardRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserAdminDashboardStatsDto> GetUserAdminDashboardStatsAsync()
        {
            try
            {
                Console.WriteLine("[DEBUG] Starting UserAdmin dashboard stats collection...");
                
                var totalAccounts = await GetTotalAccountsAsync();
                var totalCustomers = await GetTotalCustomersAsync();
                var totalStaff = await GetTotalStaffAsync();
                var activeAccounts = await GetActiveAccountsAsync();
                var inactiveAccounts = await GetInactiveAccountsAsync();
                var premiumCustomers = await GetPremiumCustomersAsync();
                var freeCustomers = await GetFreeCustomersAsync();

            return new UserAdminDashboardStatsDto
            {
                TotalAccounts = totalAccounts,
                TotalCustomers = totalCustomers,
                TotalStaff = totalStaff,
                ActiveAccounts = activeAccounts,
                InactiveAccounts = inactiveAccounts,
                PremiumCustomers = premiumCustomers,
                FreeCustomers = freeCustomers,
                AccountStatusDistribution = new AccountStatusDistributionDto
                {
                    ActiveCount = activeAccounts,
                    InactiveCount = inactiveAccounts,
                    ActivePercentage = totalAccounts > 0 ? (decimal)activeAccounts / totalAccounts * 100 : 0,
                    InactivePercentage = totalAccounts > 0 ? (decimal)inactiveAccounts / totalAccounts * 100 : 0
                },
                SubscriptionDistribution = new SubscriptionDistributionDto
                {
                    PremiumCount = premiumCustomers,
                    FreeCount = freeCustomers,
                    PremiumPercentage = totalCustomers > 0 ? (decimal)premiumCustomers / totalCustomers * 100 : 0,
                    FreePercentage = totalCustomers > 0 ? (decimal)freeCustomers / totalCustomers * 100 : 0
                }
            };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] UserAdmin dashboard stats error: {ex.Message}");
                Console.WriteLine($"[ERROR] Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<int> GetTotalAccountsAsync()
        {
            var count = await _context.Users.AsNoTracking().CountAsync();
            Console.WriteLine($"[DEBUG] Total Accounts: {count}");
            
            // Debug: List all users
            var users = await _context.Users.AsNoTracking().Select(u => new { u.Id, u.UserName, u.Email }).ToListAsync();
            Console.WriteLine($"[DEBUG] All users: {string.Join(", ", users.Select(u => $"{u.UserName}({u.Email})"))}");
            
            // Debug: List all user roles
            var userRoles = await _context.UserRoles.AsNoTracking()
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, RoleName = r.Name })
                .Join(_context.Users, ur => ur.UserId, u => u.Id, (ur, u) => new { u.UserName, ur.RoleName })
                .ToListAsync();
            Console.WriteLine($"[DEBUG] User roles: {string.Join(", ", userRoles.Select(ur => $"{ur.UserName}={ur.RoleName}"))}");
            
            return count;
        }

        public async Task<int> GetTotalCustomersAsync()
        {
            // Debug: List all roles first
            var allRoles = await _context.Roles.AsNoTracking().Select(r => r.Name).ToListAsync();
            Console.WriteLine($"[DEBUG] All roles in database: {string.Join(", ", allRoles)}");
            
            // Kiểm tra cả "Customer" và "User" role vì AuthService có thể tạo "User"
            var customerRole = await _context.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Name == "Customer");
            var userRole = await _context.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Name == "User");
            
            Console.WriteLine($"[DEBUG] Customer Role found: {customerRole?.Name ?? "NULL"}");
            Console.WriteLine($"[DEBUG] User Role found: {userRole?.Name ?? "NULL"}");
            
            var targetRole = customerRole ?? userRole;
            if (targetRole == null) 
            {
                Console.WriteLine("[DEBUG] No Customer or User role found!");
                return 0;
            }

            var count = await _context.UserRoles.AsNoTracking()
                .Where(ur => ur.RoleId == targetRole.Id)
                .CountAsync();
            Console.WriteLine($"[DEBUG] Total Customers (using {targetRole.Name} role): {count}");
            return count;
        }

        public async Task<int> GetTotalStaffAsync()
        {
            var staffRole = await _context.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Name == "Staff");
            Console.WriteLine($"[DEBUG] Staff Role found: {staffRole?.Name ?? "NULL"}");
            if (staffRole == null) return 0;

            var count = await _context.UserRoles.AsNoTracking()
                .Where(ur => ur.RoleId == staffRole.Id)
                .CountAsync();
            Console.WriteLine($"[DEBUG] Total Staff: {count}");
            return count;
        }

        public async Task<int> GetActiveAccountsAsync()
        {
            var count = await _context.Users.AsNoTracking()
                .Where(u => u.Status == UserStatus.Active)
                .CountAsync();
            Console.WriteLine($"[DEBUG] Active Accounts: {count}");
            return count;
        }

        public async Task<int> GetInactiveAccountsAsync()
        {
            var count = await _context.Users.AsNoTracking()
                .Where(u => u.Status == UserStatus.Inactive)
                .CountAsync();
            Console.WriteLine($"[DEBUG] Inactive Accounts: {count}");
            return count;
        }



        public async Task<int> GetPremiumCustomersAsync()
        {
            // Kiểm tra cả "Customer" và "User" role
            var customerRole = await _context.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Name == "Customer");
            var userRole = await _context.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Name == "User");
            
            var targetRole = customerRole ?? userRole;
            Console.WriteLine($"[DEBUG] Premium customers using role: {targetRole?.Name ?? "NULL"}");
            if (targetRole == null) return 0;

            var customerIds = await _context.UserRoles.AsNoTracking()
                .Where(ur => ur.RoleId == targetRole.Id)
                .Select(ur => ur.UserId)
                .ToListAsync();

            var count = await _context.Users.AsNoTracking()
                .Where(u => customerIds.Contains(u.Id) && u.SubscriptionLevel == SubscriptionLevel.Premium)
                .CountAsync();
            Console.WriteLine($"[DEBUG] Premium Customers: {count}");
            return count;
        }

        public async Task<int> GetFreeCustomersAsync()
        {
            // Kiểm tra cả "Customer" và "User" role
            var customerRole = await _context.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Name == "Customer");
            var userRole = await _context.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Name == "User");
            
            var targetRole = customerRole ?? userRole;
            Console.WriteLine($"[DEBUG] Free customers using role: {targetRole?.Name ?? "NULL"}");
            if (targetRole == null) return 0;

            var customerIds = await _context.UserRoles.AsNoTracking()
                .Where(ur => ur.RoleId == targetRole.Id)
                .Select(ur => ur.UserId)
                .ToListAsync();

            var count = await _context.Users.AsNoTracking()
                .Where(u => customerIds.Contains(u.Id) && u.SubscriptionLevel == SubscriptionLevel.Free)
                .CountAsync();
            Console.WriteLine($"[DEBUG] Free Customers: {count}");
            return count;
        }
    }
} 