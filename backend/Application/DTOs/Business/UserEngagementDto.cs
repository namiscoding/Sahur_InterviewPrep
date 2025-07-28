namespace InterviewPrep.API.Application.DTOs.Business
{
    public class UserEngagementDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int ActiveUsers { get; set; }
        public int SessionsStarted { get; set; }
        public int SessionsCompleted { get; set; }
        public double CompletionRate { get; set; }
        public double AverageSessionDurationSeconds { get; set; }
        public List<DailyDataPoint> DailyActiveUsers { get; set; }
    }
    public class DailyDataPoint
    {
        public string Date { get; set; } 
        public int ActiveUsers { get; set; }
    }
}
