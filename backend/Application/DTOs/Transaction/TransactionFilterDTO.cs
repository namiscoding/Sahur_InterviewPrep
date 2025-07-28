using System;

namespace InterviewPrep.API.Application.DTOs.Transaction
{
    public class TransactionFilterDTO
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? Status { get; set; }
        public string? Search { get; set; }
        public string? CustomerSearch { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
