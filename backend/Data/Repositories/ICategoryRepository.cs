using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Data.Repositories
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
        Task<Category> AddCategoryAsync(Category category, string userId);
        Task<Category?> GetCategoryByIdAsync(int id);
        Task<Category> UpdateCategoryAsync(Category category, string userId);
        Task<IEnumerable<Category>> SearchCategoriesAsync(string? categoryName, bool? isActive);
    }
}
