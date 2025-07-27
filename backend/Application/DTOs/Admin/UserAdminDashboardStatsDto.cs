namespace InterviewPrep.API.Application.DTOs.Admin
{
    public class UserAdminDashboardStatsDto
    {
        public int TotalAccounts { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalStaff { get; set; }
        public int ActiveAccounts { get; set; }
        public int InactiveAccounts { get; set; }
        public int PremiumCustomers { get; set; }
        public int FreeCustomers { get; set; }
        public AccountStatusDistributionDto AccountStatusDistribution { get; set; }
        public SubscriptionDistributionDto SubscriptionDistribution { get; set; }
    }

    public class AccountStatusDistributionDto
    {
        public int ActiveCount { get; set; }
        public int InactiveCount { get; set; }
        public decimal ActivePercentage { get; set; }
        public decimal InactivePercentage { get; set; }
    }

    public class SubscriptionDistributionDto
    {
        public int PremiumCount { get; set; }
        public int FreeCount { get; set; }
        public decimal PremiumPercentage { get; set; }
        public decimal FreePercentage { get; set; }
    }
} 