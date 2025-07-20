using InterviewPrep.API.Data.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public interface IUserAdminRepository
    {
        Task<(IEnumerable<ApplicationUser> UserAdmins, int Total)> GetAllUserAdminsAsync(string search = null, string status = null, int page = 1, int pageSize = 10);
        Task<ApplicationUser> GetUserAdminByIdAsync(string id);
        Task CreateUserAdminAsync(ApplicationUser userAdmin);
        Task UpdateUserAdminAsync(ApplicationUser userAdmin);
    }
}