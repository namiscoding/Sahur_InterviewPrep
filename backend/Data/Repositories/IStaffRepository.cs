using InterviewPrep.API.Data.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public interface IStaffRepository
    {
        Task<(IEnumerable<ApplicationUser> Staffs, int Total)> GetAllStaffAsync(string search = null, string status = null, int page = 1, int pageSize = 10);
        Task<ApplicationUser> GetStaffByIdAsync(string id);
        Task CreateStaffAsync(ApplicationUser staff);
        Task UpdateStaffAsync(ApplicationUser staff);
    }
}