namespace InterviewPrep.API.Models
{
    public class QuestionTag
    {
        public long QuestionId { get; set; }
        public int TagId { get; set; }
        public virtual Question Question { get; set; }
        public virtual Tag Tag { get; set; }
    }
}
