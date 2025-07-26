using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Data.Repositories
{
    public class SubscriptionPlanRepository : ISubscriptionPlanRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuditLogService _auditLogService;

        public SubscriptionPlanRepository(ApplicationDbContext context, IAuditLogService auditLogService)
        {
            _context = context;
            _auditLogService = auditLogService;
        }

        public async Task<IEnumerable<SubscriptionPlan>> GetAllSubscriptionPlansAsync()
        {
            return await _context.SubscriptionPlans.ToListAsync();
        }

        public async Task<SubscriptionPlan?> GetSubscriptionPlanByIdAsync(int id)
        {
            return await _context.SubscriptionPlans.FindAsync(id);
        }

        public async Task<SubscriptionPlan> UpdateSubscriptionPlanAsync(SubscriptionPlan plan)
        {
            _context.SubscriptionPlans.Update(plan);
            await _context.SaveChangesAsync();
            return plan;
        }

        
    }
}
