using AutoMapper;
using InterviewPrep.API.Application.DTOs.Subscription;
using InterviewPrep.API.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InterviewPrep.API.Controllers
{
    [ApiController]
    [Route("api/subscription")]
    public class SubscriptionPlansController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;
        private readonly ISubscriptionPlanService _subscriptionPlanService;
        private readonly IMapper _mapper;
        private readonly ILogger<SubscriptionPlansController> _logger;

        public SubscriptionPlansController(
            ISubscriptionService subscriptionService,
            ISubscriptionPlanService subscriptionPlanService,
            IMapper mapper,
            ILogger<SubscriptionPlansController> logger)
        {
            _subscriptionService = subscriptionService ?? throw new ArgumentNullException(nameof(subscriptionService));
            _subscriptionPlanService = subscriptionPlanService ?? throw new ArgumentNullException(nameof(subscriptionPlanService));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

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


        [HttpGet("staff/subscription-plans")]
        public async Task<ActionResult<IEnumerable<SubscriptionPlanDTO>>> GetAllSubscriptionPlans()
        {
            var plans = await _subscriptionPlanService.GetAllSubscriptionPlansAsync();
            return Ok(plans);
        }

        [HttpGet("staff/subscription-plans/{id}")]
        public async Task<ActionResult<SubscriptionPlanDTO>> GetSubscriptionPlanById(int id)
        {
            var plan = await _subscriptionPlanService.GetSubscriptionPlanByIdAsync(id);
            if (plan == null)
            {
                return NotFound($"Subscription Plan with ID {id} not found.");
            }
            return Ok(plan);
        }

        [HttpPut("staff/subscription-plans/{id}")]
        public async Task<ActionResult<SubscriptionPlanDTO>> UpdateSubscriptionPlanInfo(int id, [FromBody] UpdateSubscriptionPlanInfoDTO updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated or user ID not found.");
            }

            var updatedPlan = await _subscriptionPlanService.UpdateSubscriptionPlanInfoAsync(id, updateDto, userId);
            if (updatedPlan == null)
            {
                return NotFound($"Subscription Plan with ID {id} not found.");
            }
            return Ok(updatedPlan);
        }

        [HttpPatch("staff/subscription-plans/{id}/status")]
        public async Task<ActionResult<SubscriptionPlanDTO>> UpdateSubscriptionPlanStatus(int id, [FromBody] UpdateSubscriptionPlanStatusDTO updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated or user ID not found.");
            }

            var updatedPlan = await _subscriptionPlanService.UpdateSubscriptionPlanStatusAsync(id, updateDto, userId);
            if (updatedPlan == null)
            {
                return NotFound($"Subscription Plan with ID {id} not found.");
            }
            return Ok(updatedPlan);
        }
    }
}