using InterviewPrep.API.Data.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public interface IUserRepository
    {
        Task<(IEnumerable<ApplicationUser> Users, int Total)> GetAllCustomersAsync(string search = null, string status = null, int page = 1, int pageSize = 10);
        Task<ApplicationUser> GetCustomerByIdAsync(string id);
        Task UpdateUserAsync(ApplicationUser user);
    }
}