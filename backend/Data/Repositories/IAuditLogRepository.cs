using InterviewPrep.API.Data.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public interface IAuditLogRepository
    {
        Task<(IEnumerable<AuditLog> Logs, int Total)> GetAllAuditLogsAsync(string userId = null, string action = null, DateTime? from = null, DateTime? to = null, int page = 1, int pageSize = 50);
        Task AddAuditLogAsync(AuditLog log);
        Task<IEnumerable<AuditLog>> GetAllAuditLogsAsync();
        // Repository chỉ lọc theo UserId, UserName, UserRole, DateRange
        Task<IEnumerable<AuditLog>> GetFilteredAuditLogsAsync(
            string? userId,
            string? userName, // Vẫn giữ để lọc user (nếu muốn)
            string? userRole, // Vẫn giữ để lọc role (nếu muốn)
            DateTime? startDate,
            DateTime? endDate);
    }
}