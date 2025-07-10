using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Models;

namespace InterviewPrep.API.Application.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDTO>> GetAllCategoriesAsync();
        Task<CategoryDTO> AddCategoryAsync(CreateCategoryDTO categoryDto, string createdByUserId);
        Task<CategoryDTO?> UpdateCategoryInfoAsync(int id, UpdateCategoryInfoDTO updateDto); 
        Task<CategoryDTO?> UpdateCategoryStatusAsync(int id, UpdateCategoryStatusDTO updateDto);
        Task<IEnumerable<CategoryDTO>> SearchCategoriesAsync(string? categoryName, bool? isActive);
    }
}
