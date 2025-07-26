using InterviewPrep.API.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Data.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AuthRepository(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public Task<ApplicationUser> FindByEmailAsync(string email) =>
            _userManager.FindByEmailAsync(email);

        public Task<bool> CheckPasswordAsync(ApplicationUser user, string password) =>
            _userManager.CheckPasswordAsync(user, password);

        public Task<IdentityResult> CreateUserAsync(ApplicationUser user, string password) =>
            _userManager.CreateAsync(user, password);

        public Task<bool> RoleExistsAsync(string role) =>
            _roleManager.RoleExistsAsync(role);

        public Task<IdentityResult> CreateRoleAsync(string role) =>
            _roleManager.CreateAsync(new IdentityRole(role));

        public Task<IdentityResult> AddToRoleAsync(ApplicationUser user, string role) =>
            _userManager.AddToRoleAsync(user, role);

        public Task<IList<string>> GetUserRolesAsync(ApplicationUser user) =>
            _userManager.GetRolesAsync(user);

        public async Task<ApplicationUser?> GetByIdWithDetailsAsync(string userId)
        {
            return await _userManager.Users
                .Include(u => u.CreatedCategories)
                .Include(u => u.CreatedQuestions)
                .Include(u => u.MockSessions)
                .Include(u => u.UsageLogs)
                .Include(u => u.AuditLogs)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }
    }


}
