using InterviewPrep.API.Data;
using InterviewPrep.API.Data.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public class SystemSettingRepository : ISystemSettingRepository
    {
        private readonly ApplicationDbContext _context;

        public SystemSettingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<SystemSetting> SystemSettings, int Total)> GetAllSystemSettingsAsync(string prefix = null, string search = null, int page = 1, int pageSize = 10)
        {
            var query = _context.SystemSettings.AsQueryable();

            if (!string.IsNullOrEmpty(prefix))
            {
                query = query.Where(s => s.SettingKey.StartsWith(prefix));
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(s => s.SettingKey.Contains(search) || (s.Description != null && s.Description.Contains(search)));
            }

            var total = await query.CountAsync();

            var systemSettings = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (systemSettings, total);
        }

        public async Task<SystemSetting> GetSystemSettingByKeyAsync(string key)
        {
            return await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.SettingKey == key);
        }

        public async Task CreateSystemSettingAsync(SystemSetting systemSetting)
        {
            _context.SystemSettings.Add(systemSetting);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateSystemSettingAsync(SystemSetting systemSetting)
        {
            _context.SystemSettings.Update(systemSetting);
            await _context.SaveChangesAsync();
        }
    }
}