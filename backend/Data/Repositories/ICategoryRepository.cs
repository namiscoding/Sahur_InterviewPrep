using InterviewPrep.API.Models;

namespace InterviewPrep.API.Data.Repositories
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
        Task<Category> AddCategoryAsync(Category category);
        Task<Category?> GetCategoryByIdAsync(int id); 
        Task<Category> UpdateCategoryAsync(Category category);
        Task<IEnumerable<Category>> SearchCategoriesAsync(string? categoryName, bool? isActive);
    }
}
