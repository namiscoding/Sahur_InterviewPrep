using System;
using System.Collections.Generic;

namespace InterviewPrep.API.Application.DTOs.Transaction
{
    public class TransactionStatisticsDTO
    {
        public int TotalTransactions { get; set; }
        public int CompletedTransactions { get; set; }
        public int PendingTransactions { get; set; }
        public int FailedTransactions { get; set; }
        public int CancelledTransactions { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal CompletedRevenue { get; set; }
        public double SuccessRate { get; set; }
        public List<RevenueByCurrencyDTO> RevenueByCurrency { get; set; } = new List<RevenueByCurrencyDTO>();
        public DateTime? LastTransactionDate { get; set; }
        public DateTime? FirstTransactionDate { get; set; }
    }

    public class RevenueByCurrencyDTO
    {
        public string Currency { get; set; }
        public decimal TotalAmount { get; set; }
        public int TransactionCount { get; set; }
    }
} 