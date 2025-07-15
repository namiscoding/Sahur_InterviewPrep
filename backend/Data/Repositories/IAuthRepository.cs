using InterviewPrep.API.Data.Models;
using Microsoft.AspNetCore.Identity;

namespace InterviewPrep.API.Data.Repositories
{
    public interface IAuthRepository
    {
        Task<ApplicationUser> FindByEmailAsync(string email);
        Task<bool> CheckPasswordAsync(ApplicationUser user, string password);
        Task<IdentityResult> CreateUserAsync(ApplicationUser user, string password);
        Task<bool> RoleExistsAsync(string role);
        Task<IdentityResult> CreateRoleAsync(string role);
        Task<IdentityResult> AddToRoleAsync(ApplicationUser user, string role);
        Task<IList<string>> GetUserRolesAsync(ApplicationUser user);

        Task<ApplicationUser?> GetByIdWithDetailsAsync(string userId);
    }
}
