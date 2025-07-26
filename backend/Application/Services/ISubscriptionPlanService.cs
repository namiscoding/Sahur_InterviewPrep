using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.DTOs.Subscription;

namespace InterviewPrep.API.Application.Services
{
    public interface ISubscriptionPlanService
    {
        Task<IEnumerable<SubscriptionPlanDTO>> GetAllSubscriptionPlansAsync();
        Task<SubscriptionPlanDTO?> GetSubscriptionPlanByIdAsync(int id);
        Task<SubscriptionPlanDTO?> UpdateSubscriptionPlanInfoAsync(int id, UpdateSubscriptionPlanInfoDTO updateDto, string userId); 
        Task<SubscriptionPlanDTO?> UpdateSubscriptionPlanStatusAsync(int id, UpdateSubscriptionPlanStatusDTO updateDto, string userId);
    }
}
