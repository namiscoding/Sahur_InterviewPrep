using AutoMapper;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Repositories;
namespace InterviewPrep.API.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;

        public CategoryService(ICategoryRepository categoryRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        //Staff - xem danh sách Category
        public async Task<IEnumerable<CategoryDTO>> GetAllCategoriesAsync()
        {
            var categories = await _categoryRepository.GetAllCategoriesAsync();
            return _mapper.Map<IEnumerable<CategoryDTO>>(categories);
        }

        //Staff - tìm Category theo tên 
        public async Task<IEnumerable<CategoryDTO>> SearchCategoriesAsync(string? categoryName, bool? isActive)
        {
            var categories = await _categoryRepository.SearchCategoriesAsync(categoryName, isActive);
            return _mapper.Map<IEnumerable<CategoryDTO>>(categories);
        }

        //Staff - thêm Category
        public async Task<CategoryDTO> AddCategoryAsync(CreateCategoryDTO categoryDto, string userId)
        {
            var categoryToAdd = _mapper.Map<Category>(categoryDto);
            // category.CreatedBy được gán trong Repository

            var addedCategory = await _categoryRepository.AddCategoryAsync(categoryToAdd, userId);

            return _mapper.Map<CategoryDTO>(addedCategory);
        }

        //Staff - sửa thông tin Category
        public async Task<CategoryDTO?> UpdateCategoryInfoAsync(int id, UpdateCategoryInfoDTO updateDto, string userId)
        {
            var existingCategory = await _categoryRepository.GetCategoryByIdAsync(id);
            if (existingCategory == null)
            {
                return null;
            }

            _mapper.Map(updateDto, existingCategory);

            var updatedCategory = await _categoryRepository.UpdateCategoryAsync(existingCategory, userId);

            return _mapper.Map<CategoryDTO>(updatedCategory);
        }

        // Staff - sửa trạng thái Category
        public async Task<CategoryDTO?> UpdateCategoryStatusAsync(int id, UpdateCategoryStatusDTO updateDto, string userId)
        {
            var existingCategory = await _categoryRepository.GetCategoryByIdAsync(id);
            if (existingCategory == null)
            {
                return null;
            }

            existingCategory.IsActive = updateDto.IsActive;

            var updatedCategory = await _categoryRepository.UpdateCategoryAsync(existingCategory, userId);

            return _mapper.Map<CategoryDTO>(updatedCategory);
        }
    }
}
