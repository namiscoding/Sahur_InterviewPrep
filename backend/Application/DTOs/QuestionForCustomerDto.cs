namespace InterviewPrep.API.Application.DTOs
{
    public class QuestionForCustomerDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string DifficultyLevel { get; set; }
        public ICollection<CategoryForCustomerDto> Categories { get; set; }
        public ICollection<TagForCustomerDTO> Tags { get; set; }
    }
}
