using InterviewPrep.API.Data.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public interface ISystemSettingRepository
    {
        Task<(IEnumerable<SystemSetting> SystemSettings, int Total)> GetAllSystemSettingsAsync(string prefix = null, string search = null, int page = 1, int pageSize = 10);
        Task<SystemSetting> GetSystemSettingByKeyAsync(string key);
        Task CreateSystemSettingAsync(SystemSetting systemSetting);
        Task UpdateSystemSettingAsync(SystemSetting systemSetting);
    }
}