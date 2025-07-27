namespace InterviewPrep.API.Application.DTOs.SystemAdmin
{
    public class SystemAdminDashboardStatsDto
    {
        public int TotalTransactions { get; set; }
        public int CompletedTransactions { get; set; }
        public int PendingTransactions { get; set; }
        public int FailedTransactions { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalUserAdmins { get; set; }
        public int ActiveUserAdmins { get; set; }
        public int TotalUsageLimits { get; set; }
        public int SystemSettings { get; set; }
        public int TransactionsToday { get; set; }
        public decimal RevenueToday { get; set; }
        public decimal AvgTransactionValue { get; set; }
        public TransactionStatusDistributionDto TransactionStatusDistribution { get; set; }
        public UserAdminStatusDistributionDto UserAdminStatusDistribution { get; set; }
        public List<RevenueByCurrencyDto> RevenueByCurrency { get; set; }
    }

    public class TransactionStatusDistributionDto
    {
        public int CompletedCount { get; set; }
        public int PendingCount { get; set; }
        public int FailedCount { get; set; }
        public decimal CompletedPercentage { get; set; }
        public decimal PendingPercentage { get; set; }
        public decimal FailedPercentage { get; set; }
    }

    public class UserAdminStatusDistributionDto
    {
        public int ActiveCount { get; set; }
        public int InactiveCount { get; set; }
        public decimal ActivePercentage { get; set; }
        public decimal InactivePercentage { get; set; }
    }

    public class RevenueByCurrencyDto
    {
        public string Currency { get; set; }
        public decimal Amount { get; set; }
        public int TransactionCount { get; set; }
    }
} 