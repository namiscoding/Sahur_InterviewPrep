// Application/Services/AuditLogService.cs (Renamed for consistency with "AuditLog")
using AutoMapper;
using InterviewPrep.API.Application.DTOs.Audit;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPrep.API.Application.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context; // Added to populate UserEmail

        public AuditLogService(IAuditLogRepository auditLogRepository, IMapper mapper, ApplicationDbContext context)
        {
            _auditLogRepository = auditLogRepository;
            _mapper = mapper;
            _context = context;
        }

        public async Task<PagedResult<AuditLogDTO>> GetAllAuditLogsAsync(string userId = null, string action = null, DateTime? from = null, DateTime? to = null, int page = 1, int pageSize = 50)
        {
            var (logs, total) = await _auditLogRepository.GetAllAuditLogsAsync(userId, action, from, to, page, pageSize);
            var dtos = _mapper.Map<IEnumerable<AuditLogDTO>>(logs);

            // Populate UserEmail as commented
            foreach (var dto in dtos)
            {
                if (!string.IsNullOrEmpty(dto.UserId))
                {
                    var user = await _context.Users.FindAsync(dto.UserId);
                    dto.UserEmail = user?.Email;
                }
            }

            return new PagedResult<AuditLogDTO>
            {
                Data = dtos,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task LogActionAsync(string userId, string action, string ipAddress)
        {
            var log = new AuditLog
            {
                UserId = userId,
                Action = action,
                IpAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            };
            await _auditLogRepository.AddAuditLogAsync(log);
        }
    }
}