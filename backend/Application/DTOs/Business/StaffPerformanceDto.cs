namespace InterviewPrep.API.Application.DTOs.Business
{
    public class StaffPerformanceDto
    {
        public string StaffId { get; set; }
        public string StaffName { get; set; }
        public string StaffEmail { get; set; } 

        public int QuestionsCreated { get; set; }
        public int TotalQuestionUsage { get; set; }
        public decimal? AverageScoreOnQuestions { get; set; }
    }
}
