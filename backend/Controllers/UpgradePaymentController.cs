using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Application.Services.Momo;
using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Data;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;
using InterviewPrep.API.Data.Models.Momo;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
namespace InterviewPrep.API.Controllers
{
    [ApiController]
    [Route("api/payment/upgrade")]
    public class UpgradePaymentController : ControllerBase
    {
        private readonly IMomoService _momoService;
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<UpgradePaymentController> _logger;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ISubscriptionService _subscriptionService;
        private readonly ITransactionService _transactionService;
        private readonly IConfiguration _configuration;
        public UpgradePaymentController(
           IMomoService momoService,
           ApplicationDbContext dbContext,
           ILogger<UpgradePaymentController> logger,
           UserManager<ApplicationUser> userManager,
           ISubscriptionService subscriptionService,
           ITransactionService transactionService,
           IConfiguration configuration) 
        {
            _momoService = momoService ?? throw new ArgumentNullException(nameof(momoService));
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _subscriptionService = subscriptionService ?? throw new ArgumentNullException(nameof(subscriptionService));
            _transactionService = transactionService ?? throw new ArgumentNullException(nameof(transactionService));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration)); 
        }

        public class UpgradeMomoFormDataModel
        {
            public int SubscriptionPlanId { get; set; }
            public decimal Amount { get; set; }
        }

        private class ExtraDataModel
        {
            public string UserId { get; set; }
            public int SubscriptionPlanId { get; set; }
            public string? TransactionAttemptId { get; set; }
        }

        [HttpPost("initiate")]
        public async Task<IActionResult> InitiateUpgradePayment([FromBody] UpgradeMomoFormDataModel formData)
        {
            //var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userId = "user5_id";
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated.");
            }

            if (formData == null || formData.SubscriptionPlanId <= 0 || formData.Amount <= 0)
            {
                return BadRequest("Invalid request data.");
            }

            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found.");
                }

                var subscriptionPlan = await _dbContext.SubscriptionPlans
                                                     .FirstOrDefaultAsync(p => p.Id == formData.SubscriptionPlanId && p.IsActive);

                if (subscriptionPlan == null)
                {
                    return NotFound("Subscription plan not found or not available.");
                }

                if (Math.Abs(subscriptionPlan.Price - formData.Amount) > 0.01m)
                {
                    return BadRequest("Payment amount does not match the plan price.");
                }

                if ((int)user.SubscriptionLevel >= (int)subscriptionPlan.Level)
                {
                    return BadRequest("You are already subscribed to this level or higher.");
                }

                string uniqueAttemptId = $"{userId}_{subscriptionPlan.Id}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

                var extraDataObject = new ExtraDataModel
                {
                    UserId = userId,
                    SubscriptionPlanId = subscriptionPlan.Id,
                    TransactionAttemptId = uniqueAttemptId
                };
                string extraDataJson = System.Text.Json.JsonSerializer.Serialize(extraDataObject);
                string extraDataBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(extraDataJson));

                var momoRequestModel = new OrderInfoModel
                {
                    OrderId = uniqueAttemptId,
                    RequestId = uniqueAttemptId,
                    Amount = (long)subscriptionPlan.Price,
                    OrderInfo = $"Upgrade to {subscriptionPlan.Name} for User: {user.DisplayName ?? user.UserName}",
                    FullName = user.DisplayName ?? user.UserName,
                    ExtraData = extraDataBase64
                };

                var response = await _momoService.CreatePaymentMomo(momoRequestModel);

                if (response != null && response.ResultCode == 0 && !string.IsNullOrEmpty(response.PayUrl))
                {
                    return Ok(new { PayUrl = response.PayUrl });
                }
                else
                {
                    return StatusCode(500, $"Failed to create payment link: {response?.Message ?? "Unknown MoMo error"}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while initiating MoMo upgrade payment for UserId: {UserId}", userId);
                return StatusCode(500, "An internal error occurred while processing your request.");
            }
        }

        [HttpGet("callback")]
        public async Task<IActionResult> PaymentCallBack()
        {
            var collection = Request.Query;

            var callbackData = new MomoCallbackDTO();

            var frontendBaseUrl = _configuration["Frontend:ValidAudience"] ?? "http://localhost:5173"; 
            // var frontendBaseUrl = "http://localhost:5173";


            if (collection.TryGetValue("partnerCode", out var partnerCode)) callbackData.PartnerCode = partnerCode.ToString();
            if (collection.TryGetValue("orderId", out var orderId)) callbackData.OrderId = orderId.ToString();
            if (collection.TryGetValue("requestId", out var requestId)) callbackData.RequestId = requestId.ToString();
            if (collection.TryGetValue("amount", out var amountStr) && decimal.TryParse(amountStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var amountDec)) callbackData.Amount = amountDec;
            if (collection.TryGetValue("orderInfo", out var orderInfo)) callbackData.OrderInfo = orderInfo.ToString();
            if (collection.TryGetValue("orderType", out var orderType)) callbackData.OrderType = orderType.ToString();
            if (collection.TryGetValue("transId", out var transId)) callbackData.TransId = transId.ToString();
            if (collection.TryGetValue("message", out var message)) callbackData.Message = message.ToString();
            if (collection.TryGetValue("localMessage", out var localMessage)) callbackData.LocalMessage = localMessage.ToString();
            if (collection.TryGetValue("payType", out var payType)) callbackData.PayType = payType.ToString();
            if (collection.TryGetValue("responseTime", out var responseTimeStr) && long.TryParse(responseTimeStr, out var responseTime)) callbackData.ResponseTimeRaw = responseTime;
            if (collection.TryGetValue("resultCode", out var resultCodeStr) && int.TryParse(resultCodeStr, out var resultCode)) callbackData.ResultCode = resultCode;
            if (collection.TryGetValue("extraData", out var extraData)) callbackData.ExtraData = extraData.ToString();
            if (collection.TryGetValue("signature", out var signature)) callbackData.Signature = signature.ToString();

            if (string.IsNullOrEmpty(callbackData.Signature) || string.IsNullOrEmpty(callbackData.ExtraData))
            {
                return BadRequest("Invalid callback data.");
            }

            ExtraDataModel extraDataObject;
            try
            {
                var extraDataJson = Encoding.UTF8.GetString(Convert.FromBase64String(callbackData.ExtraData));
                extraDataObject = System.Text.Json.JsonSerializer.Deserialize<ExtraDataModel>(extraDataJson);
                if (extraDataObject == null || string.IsNullOrEmpty(extraDataObject.UserId) || extraDataObject.SubscriptionPlanId <= 0)
                {
                    return BadRequest("Invalid extraData content.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to decode or deserialize extraData: {ExtraData}", callbackData.ExtraData);
                return BadRequest("Invalid extraData format.");
            }

            bool isSignatureValid = _momoService.ValidateReturnUrlSignature(callbackData);

            if (!isSignatureValid)
            {
                return BadRequest("Invalid signature.");
            }

            if (callbackData.ResultCode == 0)
            {
                try
                {
                    var user = await _userManager.FindByIdAsync(extraDataObject.UserId);
                    if (user == null)
                    {
                        return NotFound("User not found.");
                    }

                    var subscriptionPlan = await _dbContext.SubscriptionPlans.FindAsync(extraDataObject.SubscriptionPlanId);
                    if (subscriptionPlan == null)
                    {
                        return NotFound("Subscription plan not found.");
                    }

                    await _subscriptionService.UpgradeUserSubscriptionAsync(
                        user.Id,
                        subscriptionPlan.Id,
                        callbackData.TransId
                    );

                    await _transactionService.LogTransactionAsync(new Transaction
                    {
                        UserId = user.Id,
                        SubscriptionPlanId = subscriptionPlan.Id,
                        Amount = callbackData.Amount,
                        Currency = subscriptionPlan.Currency,
                        TransactionDate = DateTime.UtcNow,
                        Status = TransactionStatus.Completed,
                        PaymentMethod = "MoMo",
                        ExternalTransactionId = callbackData.TransId,
                        TransactionCode = callbackData.TransId
                    });

                    // SỬA ĐỔI TẠI ĐÂY: Sử dụng frontendBaseUrl đã khai báo
                    return Redirect($"{frontendBaseUrl}/upgrade/success?orderId={callbackData.OrderId}&transId={callbackData.TransId}&resultCode={callbackData.ResultCode}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error updating user subscription after successful MoMo payment for UserId: {UserId}, PlanId: {PlanId}", extraDataObject.UserId, extraDataObject.SubscriptionPlanId);
                    // SỬA ĐỔI TẠI ĐÂY: Sử dụng frontendBaseUrl đã khai báo
                    return Redirect($"{frontendBaseUrl}/upgrade/fail?orderId={callbackData.OrderId}&resultCode=99&message=InternalServerError&localMessage={Uri.EscapeDataString("An error occurred while updating your subscription.")}");
                }
            }
            else
            {
                await _transactionService.LogTransactionAsync(new Transaction
                {
                    UserId = extraDataObject.UserId,
                    SubscriptionPlanId = extraDataObject.SubscriptionPlanId,
                    Amount = callbackData.Amount,
                    Currency = "VND",
                    TransactionDate = DateTime.UtcNow,
                    Status = TransactionStatus.Failed,
                    PaymentMethod = "MoMo",
                    ExternalTransactionId = callbackData.TransId,
                    TransactionCode = callbackData.TransId
                });

                // SỬA ĐỔI TẠI ĐÂY: Sử dụng frontendBaseUrl đã khai báo
                return Redirect($"{frontendBaseUrl}/upgrade/fail?orderId={callbackData.OrderId}&resultCode={callbackData.ResultCode}&message={Uri.EscapeDataString(callbackData.Message ?? "Payment failed.")}&localMessage={Uri.EscapeDataString(callbackData.LocalMessage ?? "")}");
            }
        }

        [HttpPost("notify")]
        public async Task<IActionResult> PaymentNotify([FromBody] MomoCallbackDTO result)
        {
            if (result == null || string.IsNullOrEmpty(result.OrderId) || string.IsNullOrEmpty(result.ExtraData))
            {
                return Ok(new { RspCode = "99", Message = "Invalid data" });
            }

            ExtraDataModel extraDataObject;
            try
            {
                var extraDataJson = Encoding.UTF8.GetString(Convert.FromBase64String(result.ExtraData));
                extraDataObject = System.Text.Json.JsonSerializer.Deserialize<ExtraDataModel>(extraDataJson);
                if (extraDataObject == null || string.IsNullOrEmpty(extraDataObject.UserId) || extraDataObject.SubscriptionPlanId <= 0)
                {
                    return Ok(new { RspCode = "99", Message = "Invalid extraData content" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "IPN: Failed to decode or deserialize extraData: {ExtraData}", result.ExtraData);
                return Ok(new { RspCode = "99", Message = "Invalid extraData" });
            }

            bool isSignatureValid = _momoService.ValidateIpnSignature(result);
            if (!isSignatureValid)
            {
                return Ok(new { RspCode = "98", Message = "Invalid signature" });
            }

            if (result.ResultCode == 0)
            {
                try
                {
                    var user = await _userManager.FindByIdAsync(extraDataObject.UserId);
                    if (user == null)
                    {
                        return Ok(new { RspCode = "02", Message = "User not found" });
                    }

                    var subscriptionPlan = await _dbContext.SubscriptionPlans.FindAsync(extraDataObject.SubscriptionPlanId);
                    if (subscriptionPlan == null)
                    {
                        return Ok(new { RspCode = "02", Message = "Subscription plan not found" });
                    }

                    // Changed to ExternalTransactionId as per Transaction model
                    var existingTransaction = await _dbContext.Transactions
                        .AnyAsync(t => t.ExternalTransactionId == result.TransId && t.Status == TransactionStatus.Completed);

                    if (existingTransaction)
                    {
                        return Ok(new { RspCode = "00", Message = "Success" });
                    }

                    await _subscriptionService.UpgradeUserSubscriptionAsync(
                        user.Id,
                        subscriptionPlan.Id,
                        result.TransId
                    );

                    await _transactionService.LogTransactionAsync(new Transaction
                    {
                        UserId = user.Id,
                        SubscriptionPlanId = subscriptionPlan.Id, // Corrected property name
                        Amount = result.Amount,
                        Currency = subscriptionPlan.Currency,
                        TransactionDate = DateTime.UtcNow, // Corrected property name
                        Status = TransactionStatus.Completed,
                        PaymentMethod = "MoMo", // Added PaymentMethod
                        ExternalTransactionId = result.TransId // Corrected property name
                    });

                    return Ok(new { RspCode = "00", Message = "Success" });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "IPN: Error updating user subscription after successful MoMo payment for UserId: {UserId}, PlanId: {PlanId}", extraDataObject.UserId, extraDataObject.SubscriptionPlanId);
                    return Ok(new { RspCode = "99", Message = "Internal Server Error during subscription update" });
                }
            }
            else
            {
                await _transactionService.LogTransactionAsync(new Transaction
                {
                    UserId = extraDataObject.UserId,
                    SubscriptionPlanId = extraDataObject.SubscriptionPlanId, // Corrected property name
                    Amount = result.Amount,
                    Currency = "VND",
                    TransactionDate = DateTime.UtcNow, // Corrected property name
                    Status = TransactionStatus.Failed,
                    PaymentMethod = "MoMo", // Added PaymentMethod
                    ExternalTransactionId = result.TransId // Corrected property name
                });

                return Ok(new { RspCode = "00", Message = "Success" });
            }
        }
    }
}