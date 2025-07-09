using InterviewPrep.API.Application.DTOs;

namespace InterviewPrep.API.Application.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDTO>> GetAllCategoriesAsync();
    }
}
