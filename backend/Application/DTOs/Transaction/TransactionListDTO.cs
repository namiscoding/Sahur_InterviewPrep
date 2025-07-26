using System;

namespace InterviewPrep.API.Application.DTOs.Transaction
{
    public class TransactionListDTO
    {
        public long Id { get; set; }
        public string TransactionCode { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public DateTime TransactionDate { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string PaymentMethod { get; set; }
        public string Status { get; set; }
        public string PlanName { get; set; }
    }
}
