namespace InterviewPrep.API.Application.DTOs.Staff
{
    public class SystemStatsDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public int TotalSessions { get; set; }
        public int ActiveSessions { get; set; }
        public double UserGrowthRate { get; set; }
        public double RevenueGrowthRate { get; set; }
        public List<MonthlyRevenue> RevenueByMonth { get; set; } = new List<MonthlyRevenue>();
    }
    public class MonthlyRevenue
    {
        public string Month { get; set; }        // Ví dụ: "07/2025"
        public decimal Amount { get; set; }      // Tổng tiền
    }
}
