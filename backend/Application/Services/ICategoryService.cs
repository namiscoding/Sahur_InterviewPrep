using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Application.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDTO>> GetAllCategoriesAsync();
        Task<IEnumerable<CategoryForCustomerDto>> GetAllCategoriesForCustomerAsync();
        Task<CategoryDTO> AddCategoryAsync(CreateCategoryDTO categoryDto, string createdByUserId);
        Task<CategoryDTO?> UpdateCategoryInfoAsync(int id, UpdateCategoryInfoDTO updateDto); 
        Task<CategoryDTO?> UpdateCategoryStatusAsync(int id, UpdateCategoryStatusDTO updateDto);
        Task<IEnumerable<CategoryDTO>> SearchCategoriesAsync(string? categoryName, bool? isActive);
    }
}
