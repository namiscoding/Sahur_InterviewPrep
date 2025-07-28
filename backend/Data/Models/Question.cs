using InterviewPrep.API.Data.Models.Enums;

namespace InterviewPrep.API.Data.Models
{
    public class Question
    {
        public long Id { get; set; }
        public string Content { get; set; }
        public string? SampleAnswer { get; set; }
        public DifficultyLevel DifficultyLevel { get; set; }
        public bool IsActive { get; set; }
        public int UsageCount { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public virtual ApplicationUser Creator { get; set; } 
        public virtual ICollection<QuestionCategory> QuestionCategories { get; set; } = new List<QuestionCategory>();
        public virtual ICollection<QuestionTag> QuestionTags { get; set; } = new List<QuestionTag>();
        public virtual ICollection<SessionAnswer> SessionAnswers { get; set; } = new List<SessionAnswer>();
    }
}
