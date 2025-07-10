using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InterviewPrep.API.Controllers
{
    [Route("api/staff/categories")]
    [ApiController]
    public class StaffCategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        public StaffCategoriesController(ICategoryService categoriasService)
        {
            _categoryService = categoriasService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDTO>>> GetAllCategories()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("search")]
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

        [HttpPost]
        public async Task<ActionResult<CategoryDTO>> AddCategory([FromBody] CreateCategoryDTO createCategoryDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            //Trả id người dùng vào đây 
            //var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userId = "A96EA2FC-E8C7-44DB-9862-9BC87C0B583B"; 
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated or user ID not found.");
            }

            var newCategory = await _categoryService.AddCategoryAsync(createCategoryDto, userId);

            
            return CreatedAtAction(nameof(GetAllCategories), new { id = newCategory.Id }, newCategory);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDTO>> UpdateCategoryInfo(int id, [FromBody] UpdateCategoryInfoDTO updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updateCategory = await _categoryService.UpdateCategoryInfoAsync(id, updateDto);
            if (updateCategory == null)
            {
                return NotFound($"Khong tim thay Category ID {id}");
            }
            return Ok(updateCategory);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<CategoryDTO>> UpdateCategoryStatus(int id, [FromBody] UpdateCategoryStatusDTO updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var updateCategory = await _categoryService.UpdateCategoryStatusAsync(id, updateDto);
            if (updateCategory == null)
            {
                return NotFound($"Khong tim thay Category ID {id}");
            }
            return Ok(updateCategory);
        }
    }
}
