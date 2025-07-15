using InterviewPrep.API.Data;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<ApplicationUser> Users, int Total)> GetAllCustomersAsync(string search = null, string status = null, int page = 1, int pageSize = 10)
        {
            var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Customer");
            if (customerRole == null) return (Enumerable.Empty<ApplicationUser>(), 0);

            var customerIds = await _context.UserRoles
                .Where(ur => ur.RoleId == customerRole.Id)
                .Select(ur => ur.UserId)
                .ToListAsync();

            var query = _context.Users
                .Where(u => customerIds.Contains(u.Id))
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

            var users = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (users, total);
        }

        public async Task<ApplicationUser> GetCustomerByIdAsync(string id)
        {
            return await _context.Users
                .Include(u => u.Transactions)
                .Include(u => u.MockSessions)
                .Include(u => u.UsageLogs)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task UpdateUserAsync(ApplicationUser user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }
    }
}