using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.DTOs.Question;
using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Application.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDTO>> GetAllCategoriesAsync();
        Task<IEnumerable<CategoryForCustomerDto>> GetAllCategoriesForCustomerAsync();
        Task<CategoryDTO> AddCategoryAsync(CreateCategoryDTO categoryDto, string createdByUserId);
        Task<CategoryDTO?> UpdateCategoryInfoAsync(int id, UpdateCategoryInfoDTO updateDto, string userId);
        Task<CategoryDTO?> UpdateCategoryStatusAsync(int id, UpdateCategoryStatusDTO updateDto, string userId);
        Task<IEnumerable<CategoryDTO>> SearchCategoriesAsync(string? categoryName, bool? isActive);
    }
}
