using AutoMapper;
using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Repositories;
namespace InterviewPrep.API.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IQuestionRepository _questionRepository;
        private readonly IMapper _mapper;

        public CategoryService(ICategoryRepository categoryRepository, IQuestionRepository questionRepository, IMapper mapper)
        {
            _categoryRepository = categoryRepository;
            _questionRepository = questionRepository; 
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

            bool oldStatus = existingCategory.IsActive; 
            existingCategory.IsActive = updateDto.IsActive;

            var updatedCategory = await _categoryRepository.UpdateCategoryAsync(existingCategory, userId);

           
            if (oldStatus == true && updateDto.IsActive == false)
            {
                var relatedQuestions = await _questionRepository.GetQuestionsByCategoryIdAsync(id);
                if (relatedQuestions.Any())
                {
                    var questionIdsToUpdate = relatedQuestions.Select(q => q.Id).ToList();
                    await _questionRepository.UpdateQuestionsStatusAsync(questionIdsToUpdate, false); 
                }
            }

            return _mapper.Map<CategoryDTO>(updatedCategory);
        }

        public async Task<IEnumerable<CategoryForCustomerDto>> GetAllCategoriesForCustomerAsync()
        {
            var categories = await _categoryRepository.GetAllCategoriesAsync();
            return _mapper.Map<IEnumerable<CategoryForCustomerDto>>(categories);
        }
    }
}
