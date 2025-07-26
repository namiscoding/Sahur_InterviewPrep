using AutoMapper;
using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.DTOs.Subscription;
using InterviewPrep.API.Data.Repositories;

namespace InterviewPrep.API.Application.Services
{
    public class SubscriptionPlanService : ISubscriptionPlanService
    {
        private readonly ISubscriptionPlanRepository _subscriptionPlanRepository;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService; // Inject AuditLog Service

        public SubscriptionPlanService(ISubscriptionPlanRepository subscriptionPlanRepository, IMapper mapper, IAuditLogService auditLogService)
        {
            _subscriptionPlanRepository = subscriptionPlanRepository;
            _mapper = mapper;
            _auditLogService = auditLogService;
        }

        public async Task<IEnumerable<SubscriptionPlanDTO>> GetAllSubscriptionPlansAsync()
        {
            var plans = await _subscriptionPlanRepository.GetAllSubscriptionPlansAsync();
            return _mapper.Map<IEnumerable<SubscriptionPlanDTO>>(plans);
        }

        public async Task<SubscriptionPlanDTO?> GetSubscriptionPlanByIdAsync(int id)
        {
            var plan = await _subscriptionPlanRepository.GetSubscriptionPlanByIdAsync(id);
            return _mapper.Map<SubscriptionPlanDTO>(plan);
        }

        public async Task<SubscriptionPlanDTO?> UpdateSubscriptionPlanInfoAsync(int id, UpdateSubscriptionPlanInfoDTO updateDto, string userId)
        {
            var existingPlan = await _subscriptionPlanRepository.GetSubscriptionPlanByIdAsync(id);
            if (existingPlan == null)
            {
                return null;
            }

            
            _mapper.Map(updateDto, existingPlan);

           
            var updatedPlan = await _subscriptionPlanRepository.UpdateSubscriptionPlanAsync(existingPlan);
            await _auditLogService.LogActionAsync(userId, $"Updated Subscription Plan Info: ID={updatedPlan.Id}, Name='{updatedPlan.Name}'", null);

            return _mapper.Map<SubscriptionPlanDTO>(updatedPlan);
        }

        public async Task<SubscriptionPlanDTO?> UpdateSubscriptionPlanStatusAsync(int id, UpdateSubscriptionPlanStatusDTO updateDto, string userId)
        {
            var existingPlan = await _subscriptionPlanRepository.GetSubscriptionPlanByIdAsync(id);
            if (existingPlan == null)
            {
                return null;
            }

            bool oldStatus = existingPlan.IsActive; 
            existingPlan.IsActive = updateDto.IsActive; 

            var updatedPlan = await _subscriptionPlanRepository.UpdateSubscriptionPlanAsync(existingPlan);

            
            string actionType = updateDto.IsActive ? "Activated" : "Inactivated";
            await _auditLogService.LogActionAsync(userId, $"{actionType} Subscription Plan: ID={updatedPlan.Id}, Name='{updatedPlan.Name}'", null);

            return _mapper.Map<SubscriptionPlanDTO>(updatedPlan);
        }
    }
}
