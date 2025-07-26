using InterviewPrep.API.Application.DTOs.SystemSetting;

namespace InterviewPrep.API.Application.Services
{
    public interface ISystemSettingService
    {
        Task<PagedResult<SystemSettingDTO>> GetAllSystemSettingsAsync(string prefix = "FREE_USER_", string search = null, int page = 1, int pageSize = 10);
        Task<SystemSettingDTO> GetSystemSettingByKeyAsync(string key);
        Task<SystemSettingDTO> CreateSystemSettingAsync(CreateSystemSettingDTO createDto);
        Task<SystemSettingDTO> UpdateSystemSettingAsync(string key, UpdateSystemSettingDTO updateDto);
    }
}