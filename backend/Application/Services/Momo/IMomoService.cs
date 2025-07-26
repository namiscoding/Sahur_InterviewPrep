
using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Data.Models.Momo;

namespace InterviewPrep.API.Application.Services.Momo
{
    public interface IMomoService
    {
        public Task<MomoCreatePaymentResponseModel> CreatePaymentMomo(OrderInfoModel model);
        //public MomoExecuteResponseModel PaymentExecuteAsync(IQueryCollection collection);
        bool ValidateReturnUrlSignature(MomoCallbackDTO callbackData); // Đổi tên để rõ ràng hơn
        bool ValidateIpnSignature(MomoCallbackDTO ipnData); // Phương thức mới cho IPN
    }
}
