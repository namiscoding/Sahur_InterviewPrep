using AutoMapper;
using InterviewPrep.API.Application.DTOs.Subscription;
using InterviewPrep.API.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrep.API.Controllers
{
    [ApiController]
    [Route("api/subscription")]
    public class SubscriptionPlansController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;
        private readonly IMapper _mapper;
        private readonly ILogger<SubscriptionPlansController> _logger;

        public SubscriptionPlansController(
            ISubscriptionService subscriptionService,
            IMapper mapper,
            ILogger<SubscriptionPlansController> logger)
        {
            _subscriptionService = subscriptionService ?? throw new ArgumentNullException(nameof(subscriptionService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get all active subscription plans
        /// </summary>
        [HttpGet("plans")]
        public async Task<ActionResult<List<SubscriptionPlanDTO>>> GetActiveSubscriptionPlans()
        {
            try
            {
                var plans = await _subscriptionService.GetActiveSubscriptionPlansAsync();
                var planDTOs = _mapper.Map<List<SubscriptionPlanDTO>>(plans);

                _logger.LogInformation("Retrieved {Count} active subscription plans", planDTOs.Count);
                return Ok(planDTOs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active subscription plans");
                return StatusCode(500, "An error occurred while retrieving subscription plans.");
            }
        }

        /// <summary>
        /// Get a specific subscription plan by ID
        /// </summary>
        [HttpGet("plans/{id}")]
        public async Task<ActionResult<SubscriptionPlanDTO>> GetSubscriptionPlan(int id)
        {
            try
            {
                var plan = await _subscriptionService.GetSubscriptionPlanAsync(id);
                if (plan == null)
                {
                    _logger.LogWarning("Subscription plan with ID {PlanId} not found", id);
                    return NotFound("Subscription plan not found.");
                }

                var planDTO = _mapper.Map<SubscriptionPlanDTO>(plan);
                return Ok(planDTO);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription plan {PlanId}", id);
                return StatusCode(500, "An error occurred while retrieving the subscription plan.");
            }
        }
    }
}
