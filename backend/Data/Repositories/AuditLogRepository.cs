using InterviewPrep.API.Data;
using InterviewPrep.API.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AuditLogRepository(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<(IEnumerable<AuditLog> Logs, int Total)> GetAllAuditLogsAsync(string userId = null, string action = null, DateTime? from = null, DateTime? to = null, int page = 1, int pageSize = 50)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(l => l.UserId == userId);
            }

            if (!string.IsNullOrEmpty(action))
            {
                query = query.Where(l => l.Action.Contains(action));
            }

            if (from.HasValue)
            {
                query = query.Where(l => l.CreatedAt >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(l => l.CreatedAt <= to.Value);
            }

            var total = await query.CountAsync();

            var logs = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (logs, total);
        }

        public async Task AddAuditLogAsync(AuditLog log)
        {
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetAllAuditLogsAsync()
        {
            return await _context.AuditLogs.OrderByDescending(al => al.CreatedAt).ToListAsync();
        }

        public async Task<IEnumerable<AuditLog>> GetFilteredAuditLogsAsync(
            string? userId,
            string? userName, 
            string? userRole, 
            DateTime? startDate,
            DateTime? endDate)
        {
            var query = _context.AuditLogs.AsQueryable();

           
            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(al => al.UserId == userId);
            }

            
            if (startDate.HasValue)
            {
                query = query.Where(al => al.CreatedAt >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                query = query.Where(al => al.CreatedAt <= endDate.Value.AddDays(1).AddTicks(-1));
            }

            query = query.OrderByDescending(al => al.CreatedAt);

            var logs = await query.ToListAsync(); 
            if (!string.IsNullOrEmpty(userName) || !string.IsNullOrEmpty(userRole))
            {
                var users = await _userManager.Users.ToDictionaryAsync(u => u.Id);
                var userRolesInDb = await _context.UserRoles.ToListAsync();
                var rolesInDb = await _roleManager.Roles.ToListAsync();

                logs = logs.Where(log => {
                    if (log.UserId == null || !users.TryGetValue(log.UserId, out var user))
                    {
                        return false; 
                    }

                    
                    if (!string.IsNullOrEmpty(userName) && !user.DisplayName.ToLower().Contains(userName.ToLower()))
                    {
                        return false;
                    }

                    
                    if (!string.IsNullOrEmpty(userRole))
                    {
                        var roleId = userRolesInDb.FirstOrDefault(ur => ur.UserId == user.Id)?.RoleId;
                        var userActualRoleName = roleId != null ? rolesInDb.FirstOrDefault(r => r.Id == roleId)?.Name : null;
                        if (userActualRoleName == null || !userActualRoleName.Equals(userRole, StringComparison.OrdinalIgnoreCase))
                        {
                            return false;
                        }
                    }
                    return true; 
                }).ToList();
            }

            return logs;
        }
    }
}