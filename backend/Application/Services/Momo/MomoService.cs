using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Data.Models.Momo;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Org.BouncyCastle.Asn1.Crmf;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Security.Cryptography;
using System.Text;
using System.Diagnostics;
using System.Globalization;
using Microsoft.CodeAnalysis;
using RestSharp;
namespace InterviewPrep.API.Application.Services.Momo
{
    public class MomoService : IMomoService
    {
        private readonly IOptions<MomoOptionModel> _options;
        private readonly ILogger<MomoService> _logger;

        public MomoService(IOptions<MomoOptionModel> options, ILogger<MomoService> logger)
        {
            _options = options ?? throw new ArgumentNullException(nameof(options));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<MomoCreatePaymentResponseModel> CreatePaymentMomo(OrderInfoModel model)
        {
            string uniqueOrderId = model.OrderId;
            string uniqueRequestId = model.RequestId;
            string orderInfo = model.OrderInfo;
            string extraData = model.ExtraData;

            var rawData = $"accessKey={_options.Value.AccessKey}" +
                          $"&amount={model.Amount.ToString(CultureInfo.InvariantCulture)}" +
                          $"&extraData={extraData}" +
                          $"&ipnUrl={_options.Value.NotifyUrl}" +
                          $"&orderId={uniqueOrderId}" +
                          $"&orderInfo={orderInfo}" +
                          $"&partnerCode={_options.Value.PartnerCode}" +
                          $"&redirectUrl={_options.Value.ReturnUrl}" +
                          $"&requestId={uniqueRequestId}" +
                          $"&requestType={_options.Value.RequestType}";

            _logger.LogInformation("Raw data string for signature calculation: [{RawDataString}]", rawData);


            var signature = ComputeHmacSha256(rawData, _options.Value.SecretKey);

            var requestData = new
            {
                partnerCode = _options.Value.PartnerCode,
                requestId = uniqueRequestId,
                amount = (long)model.Amount,
                orderId = uniqueOrderId,
                orderInfo = orderInfo,
                redirectUrl = _options.Value.ReturnUrl,
                ipnUrl = _options.Value.NotifyUrl,
                extraData = extraData,
                requestType = _options.Value.RequestType,
                lang = "vi",
                signature = signature
            };

            var client = new RestClient(_options.Value.MomoApiUrl);
            var request = new RestRequest() { Method = RestSharp.Method.Post };
            request.AddHeader("Content-Type", "application/json; charset=UTF-8");
            request.AddParameter("application/json", System.Text.Json.JsonSerializer.Serialize(requestData), ParameterType.RequestBody);
            _logger.LogInformation("Sending MoMo Request (AttemptID: {AttemptId}): {RequestBody}", uniqueOrderId, System.Text.Json.JsonSerializer.Serialize(requestData));
            var response = await client.ExecuteAsync(request);

            _logger.LogInformation("Received MoMo Response Status: {StatusCode}, Content: {Content}", response.StatusCode, response.Content);
            var momoResponse = new MomoCreatePaymentResponseModel();
            if (response.IsSuccessful && !string.IsNullOrEmpty(response.Content))
            {
                try
                {
                    var options = new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    momoResponse = System.Text.Json.JsonSerializer.Deserialize<MomoCreatePaymentResponseModel>(response.Content, options);

                    if (momoResponse != null && momoResponse.ResultCode == 0 && !string.IsNullOrEmpty(momoResponse.PayUrl))
                    {
                        _logger.LogInformation(">>> SUCCESSFUL DESERIALIZATION <<< : ResultCode={ResultCode}, Message={Message}, PayUrl={PayUrl}", momoResponse.ResultCode, momoResponse.Message, momoResponse.PayUrl);
                    }
                    else
                    {
                        _logger.LogWarning("Parsed MoMo Response but PayUrl is missing or ResultCode is not 0. Parsed ResultCode={ResultCode}, Parsed Message={Message}, Parsed PayUrl={PayUrl}. Raw Content: {RawContent}",
                                           momoResponse?.ResultCode, momoResponse?.Message, momoResponse?.PayUrl, response.Content);
                        if (momoResponse != null)
                        {
                            momoResponse.ResultCode = momoResponse.ResultCode != 0 ? momoResponse.ResultCode : 98;
                            momoResponse.Message = momoResponse.Message ?? "Parsed successfully but critical data missing (e.g., PayUrl).";
                        }
                        else
                        {
                            momoResponse = new MomoCreatePaymentResponseModel { ResultCode = 99, Message = "Deserialization resulted in null object." };
                        }
                    }
                }
                catch (System.Text.Json.JsonException jsonEx)
                {
                    _logger.LogError(jsonEx, "Failed to parse MoMo JSON response (AttemptID: {AttemptId}): {Content}", model.OrderId, response.Content);
                    momoResponse = new MomoCreatePaymentResponseModel { ResultCode = 99, Message = "Failed to parse MoMo response." };
                }
            }
            else
            {
                momoResponse = new MomoCreatePaymentResponseModel { ResultCode = (int?)response.StatusCode ?? 99, Message = $"MoMo request failed: {response.ErrorMessage ?? response.StatusDescription}" };
            }
            return momoResponse;
        }

        public bool ValidateReturnUrlSignature(MomoCallbackDTO callbackData)
        {
            var accessKeyFromConfig = _options.Value.AccessKey;
            var secretKey = _options.Value.SecretKey;

            var rawHash = $"accessKey={accessKeyFromConfig}" +
                           $"&amount={callbackData.Amount.ToString(CultureInfo.InvariantCulture)}" +
                           $"&extraData={callbackData.ExtraData}" +
                           $"&message={callbackData.Message}" +
                           $"&orderId={callbackData.OrderId}" +
                           $"&orderInfo={callbackData.OrderInfo}" +
                           $"&orderType={callbackData.OrderType}" +
                           $"&partnerCode={callbackData.PartnerCode}" +
                           $"&payType={callbackData.PayType}" +
                           $"&requestId={callbackData.RequestId}" +
                           $"&responseTime={callbackData.ResponseTimeRaw}" +
                           $"&resultCode={callbackData.ResultCode}" +
                           $"&transId={callbackData.TransId}";

            _logger.LogInformation("Raw hash string for RETURN URL validation (Corrected Format): [{RawHash}]", rawHash);
            _logger.LogInformation("Received signature from RETURN URL: [{Signature}]", callbackData.Signature);

            string calculatedSignature = ComputeHmacSha256(rawHash, secretKey);
            _logger.LogInformation("Calculated signature for RETURN URL: [{Signature}]", calculatedSignature);

            bool isValid = string.Equals(calculatedSignature, callbackData.Signature, StringComparison.OrdinalIgnoreCase);
            _logger.LogInformation("Return URL Signature validation result: {IsValid}", isValid);

            return isValid;
        }

        public bool ValidateIpnSignature(MomoCallbackDTO ipnData)
        {
            if (ipnData == null || string.IsNullOrEmpty(ipnData.Signature))
            {
                _logger.LogWarning("IPN data or signature is null/empty.");
                return false;
            }

            var accessKey = _options.Value.AccessKey;
            var secretKey = _options.Value.SecretKey;

            if (string.IsNullOrEmpty(accessKey) || string.IsNullOrEmpty(secretKey))
            {
                _logger.LogError("AccessKey or SecretKey is null or empty in configuration for IPN validation.");
                return false;
            }

            var rawHash = $"accessKey={accessKey}" +
                          $"&amount={ipnData.Amount.ToString(CultureInfo.InvariantCulture)}" +
                          $"&extraData={ipnData.ExtraData}" +
                          $"&message={ipnData.Message}" +
                          $"&orderId={ipnData.OrderId}" +
                          $"&orderInfo={ipnData.OrderInfo}" +
                          $"&orderType={ipnData.OrderType}" +
                          $"&partnerCode={ipnData.PartnerCode}" +
                          $"&payType={ipnData.PayType}" +
                          $"&requestId={ipnData.RequestId}" +
                          $"&responseTime={ipnData.ResponseTimeRaw}" +
                          $"&resultCode={ipnData.ResultCode}" +
                          $"&transId={ipnData.TransId}";

            _logger.LogInformation("Raw hash string for IPN validation: [{RawHash}]", rawHash);
            _logger.LogInformation("Received IPN signature: [{Signature}]", ipnData.Signature);

            string calculatedSignature = ComputeHmacSha256(rawHash, secretKey);
            _logger.LogInformation("Calculated IPN signature: [{Signature}]", calculatedSignature);

            bool isValid = string.Equals(calculatedSignature, ipnData.Signature, StringComparison.OrdinalIgnoreCase);
            _logger.LogInformation("IPN Signature validation result: {IsValid}", isValid);

            return isValid;
        }

        private string ComputeHmacSha256(string message, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var messageBytes = Encoding.UTF8.GetBytes(message);
            byte[] hashBytes;
            using (var hmac = new HMACSHA256(keyBytes))
            {
                hashBytes = hmac.ComputeHash(messageBytes);
            }
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }
    }

    public class MomoOptionModel
    {
        public string MomoApiUrl { get; set; }
        public string PartnerCode { get; set; }
        public string AccessKey { get; set; }
        public string SecretKey { get; set; }
        public string ReturnUrl { get; set; }
        public string NotifyUrl { get; set; }
        public string RequestType { get; set; }
    }


    public class MomoCreatePaymentResponseModel
    {
        public string PartnerCode { get; set; }
        public string RequestId { get; set; }
        public string OrderId { get; set; }
        public long Amount { get; set; }
        public long ResponseTime { get; set; }
        public string Message { get; set; }
        public int ResultCode { get; set; }
        public string PayUrl { get; set; }
        public string DeepLink { get; set; }
        public string QrCodeUrl { get; set; }
    }
}