namespace InterviewPrep.API.Application.DTOs.Question
{
    public class QuestionExcelDTO
    {
        public string Content { get; set; }
        public string? SampleAnswer { get; set; }
        public string DifficultyLevel { get; set; } 
        public bool IsActive { get; set; }
        public string? CategoryNames { get; set; }
        public string? TagNames { get; set; }
    }
}
