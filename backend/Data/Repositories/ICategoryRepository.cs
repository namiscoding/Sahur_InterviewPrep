using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Data.Repositories
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
    }
}
