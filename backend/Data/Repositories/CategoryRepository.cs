using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Data.Models;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace InterviewPrep.API.Data.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuditLogService _auditLogService;
        public CategoryRepository(ApplicationDbContext context, IAuditLogService auditLogService)
        {
            _context = context;
            _auditLogService = auditLogService;
        }
        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
           return await _context.Categories.ToListAsync();
        }
        public async Task<Category> AddCategoryAsync(Category category, string userId)
        {
            
            category.CreatedBy = userId;

            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();

           
            await _auditLogService.LogCategoryActionAsync(userId, "Added", category.Id, category.Name, null);
            return category;
        }

        public async Task<Category?> GetCategoryByIdAsync(int id)
        {
            return await _context.Categories.FindAsync(id);
        }


        public async Task<Category> UpdateCategoryAsync(Category category, string userId)
        {
            _context.Categories.Update(category);
            await _context.SaveChangesAsync();
            
            //await _auditLogService.LogCategoryActionAsync(userId, "Updated", category.Id, category.Name, null);
            return category;
        }

        public async Task<IEnumerable<Category>> SearchCategoriesAsync(string? categoryName, bool? isActive)
        {
            var query = _context.Categories.AsQueryable();

            if (!string.IsNullOrWhiteSpace(categoryName))
            {
                query = query.Where(c => c.Name.Contains(categoryName));
            }

            if (isActive.HasValue)
            {
                query = query.Where(c => c.IsActive == isActive.Value);
            }

            return await query.ToListAsync();
        }
    }
}
