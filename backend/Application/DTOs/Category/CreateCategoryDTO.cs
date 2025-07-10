namespace InterviewPrep.API.Application.DTOs.Category
{
    public class CreateCategoryDTO
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
