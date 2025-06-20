namespace InterviewPrep.API.Models
{
    public class Tag
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public virtual ICollection<QuestionTag> QuestionTags { get; set; } = new List<QuestionTag>();
    }
}
