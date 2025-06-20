namespace InterviewPrep.API.Models
{
    public class QuestionCategory
    {
        public long QuestionId { get; set; }
        public int CategoryId { get; set; }
        public virtual Question Question { get; set; }
        public virtual Category Category { get; set; }
    }
}
