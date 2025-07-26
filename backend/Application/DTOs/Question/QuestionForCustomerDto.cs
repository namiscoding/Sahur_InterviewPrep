namespace InterviewPrep.API.Application.DTOs.Question
{
    public class QuestionForCustomerDto
    {
        public long Id { get; set; }
        public string Content { get; set; }
        public string? SampleAnswer { get; set; }
        public string DifficultyLevel { get; set; }
        public ICollection<CategoryForCustomerDto> Categories { get; set; }
        public ICollection<TagForCustomerDTO> Tags { get; set; }
    }
}
