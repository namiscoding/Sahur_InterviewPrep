namespace InterviewPrep.API.Data.Models.Momo
{
    public class MomoCreatePaymentRequestModel
    {
        public string OrderId { get; set; }
        public string RequestId { get; set; }
        public long Amount { get; set; } // MoMo yêu cầu kiểu long
        public string OrderInfo { get; set; }
        public string? FullName { get; set; } // Có thể nullable
        public string ExtraData { get; set; }
    }
}
