using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InterviewPrep.API.Controllers
{
    [Route("api")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        public CategoriesController(ICategoryService categoriasService)
        {
            _categoryService = categoriasService;
        }

        [HttpGet("staff/categories")]
        public async Task<ActionResult<IEnumerable<CategoryDTO>>> GetAllCategories()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<CategoryDTO>>> GetAllCategoriesForCustomer()
        {
            var categories = await _categoryService.GetAllCategoriesForCustomerAsync();
            return Ok(categories);
        }

        [HttpGet("staff/categories/search")]
        public async Task<ActionResult<IEnumerable<CategoryDTO>>> SearchCategories([FromQuery] string? name, [FromQuery] bool? isActive)
        {
            if (string.IsNullOrWhiteSpace(name) && !isActive.HasValue)
            {
                return await GetAllCategories();
            }

            var categories = await _categoryService.SearchCategoriesAsync(name, isActive);

            if (!categories.Any())
            {
                return NotFound("Khong tim thay category");
            }

            return Ok(categories);
        }

        [HttpPost("staff/categories")]
        public async Task<ActionResult<CategoryDTO>> AddCategory([FromBody] CreateCategoryDTO createCategoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                // TẠM THỜI cho dev/test, hãy thay bằng ID user thật sự trong DB khi có Auth
                userId = "A96EA2FC-E8C7-44DB-9862-9BC87C0B583B";
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User is not authenticated or user ID not found.");
                }
            }

            var newCategory = await _categoryService.AddCategoryAsync(createCategoryDto, userId);


            return CreatedAtAction(nameof(GetAllCategories), new { id = newCategory.Id }, newCategory);
        }

        [HttpPut("staff/categories/{id}")]
        public async Task<ActionResult<CategoryDTO>> UpdateCategoryInfo(int id, [FromBody] UpdateCategoryInfoDTO updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                userId = "A96EA2FC-E8C7-44DB-9862-9BC87C0B583B";
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User is not authenticated or user ID not found.");
                }
            }

            var updatedCategory = await _categoryService.UpdateCategoryInfoAsync(id, updateDto, userId);

            if (updatedCategory == null)
            {
                return NotFound($"Category with ID {id} not found.");
            }

            return Ok(updatedCategory);
        }

        [HttpPut("staff/categories/{id}/status")]
        public async Task<ActionResult<CategoryDTO>> UpdateCategoryStatus(int id, [FromBody] UpdateCategoryStatusDTO updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                userId = "A96EA2FC-E8C7-44DB-9862-9BC87C0B583B";
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User is not authenticated or user ID not found.");
                }
            }

            var updatedCategory = await _categoryService.UpdateCategoryStatusAsync(id, updateDto, userId);

            if (updatedCategory == null)
            {
                return NotFound($"Category with ID {id} not found.");
            }

            return Ok(updatedCategory);
        }
    }
}
