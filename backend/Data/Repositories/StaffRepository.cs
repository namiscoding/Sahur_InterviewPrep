using InterviewPrep.API.Data;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public class StaffRepository : IStaffRepository
    {
        private readonly ApplicationDbContext _context;

        public StaffRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<ApplicationUser> Staffs, int Total)> GetAllStaffAsync(string search = null, string status = null, int page = 1, int pageSize = 10)
        {
            var staffRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Staff");
            if (staffRole == null) return (Enumerable.Empty<ApplicationUser>(), 0);

            var query = _context.Users
                .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { User = u, ur.RoleId })
                .Where(join => join.RoleId == staffRole.Id)
                .Select(join => join.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u => u.DisplayName.Contains(search) || u.Email.Contains(search));
            }

            if (!string.IsNullOrEmpty(status) && Enum.TryParse<UserStatus>(status, true, out var parsedStatus))
            {
                query = query.Where(u => u.Status == parsedStatus);
            }

            var total = await query.CountAsync();

            var staffs = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (staffs, total);
        }

        public async Task<ApplicationUser> GetStaffByIdAsync(string id)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task CreateStaffAsync(ApplicationUser staff)
        {
            _context.Users.Add(staff);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateStaffAsync(ApplicationUser staff)
        {
            _context.Users.Update(staff);
            await _context.SaveChangesAsync();
        }
    }
}