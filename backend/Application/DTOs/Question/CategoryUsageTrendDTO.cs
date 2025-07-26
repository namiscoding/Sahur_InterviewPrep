namespace InterviewPrep.API.Application.DTOs.Question
{
    public class CategoryUsageTrendDTO
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public long TotalUsageCount { get; set; }
        public int NumberOfQuestions { get; set; }
    }
}
