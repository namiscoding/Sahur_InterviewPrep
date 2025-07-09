using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
    }
}
