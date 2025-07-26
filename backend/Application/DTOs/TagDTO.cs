namespace InterviewPrep.API.Application.DTOs
{
    public class TagDTO
    {
        public int Id { get; set; }     
        public string Name { get; set; }
        public string Slug { get; set; } = string.Empty;
    }
}
