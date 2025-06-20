namespace InterviewPrep.API.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public string? CreatedBy { get; set; } 
        public virtual ApplicationUser? Creator { get; set; } 
        public virtual ICollection<QuestionCategory> QuestionCategories { get; set; } = new List<QuestionCategory>();
    }
}
