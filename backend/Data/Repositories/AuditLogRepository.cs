using InterviewPrep.API.Data;
using InterviewPrep.API.Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly ApplicationDbContext _context;

        public AuditLogRepository(ApplicationDbContext context)
        {
            _context = context;
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
    }
}