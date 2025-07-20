using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.DTOs.Subscription;

namespace InterviewPrep.API.Application.Services
{
    public interface ISubscriptionPlansService
    {
        Task<IEnumerable<SubscriptionPlanDTO>> GetAllSubscriptionPlansAsync();
    }
}
