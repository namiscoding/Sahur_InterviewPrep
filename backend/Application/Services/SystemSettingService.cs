using AutoMapper;
using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.DTOs.SystemSetting;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InterviewPrep.API.Application.Services
{
    public class SystemSettingService : ISystemSettingService
    {
        private readonly ISystemSettingRepository _systemSettingRepository;
        private readonly IMapper _mapper;

        public SystemSettingService(
            ISystemSettingRepository systemSettingRepository,
            IMapper mapper)
        {
            _systemSettingRepository = systemSettingRepository;
            _mapper = mapper;
        }

        public async Task<PagedResult<SystemSettingDTO>> GetAllSystemSettingsAsync(string prefix = "FREE_USER_", string search = null, int page = 1, int pageSize = 10)
        {
            var (systemSettings, total) = await _systemSettingRepository.GetAllSystemSettingsAsync(prefix, search, page, pageSize);
            var dtos = _mapper.Map<IEnumerable<SystemSettingDTO>>(systemSettings);
            return new PagedResult<SystemSettingDTO>
            {
                Items = dtos,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<SystemSettingDTO> GetSystemSettingByKeyAsync(string key)
        {
            if (!key.StartsWith("FREE_USER_"))
            {
                throw new Exception("Access restricted to free user settings.");
            }

            var systemSetting = await _systemSettingRepository.GetSystemSettingByKeyAsync(key);
            if (systemSetting == null) return null;
            return _mapper.Map<SystemSettingDTO>(systemSetting);
        }

        public async Task<SystemSettingDTO> CreateSystemSettingAsync(CreateSystemSettingDTO createDto)
        {
            if (!createDto.SettingKey.StartsWith("FREE_USER_"))
            {
                throw new Exception("Creation restricted to free user settings.");
            }

            if (!int.TryParse(createDto.SettingValue, out int value) || value <= 0)
            {
                throw new Exception("Setting value must be a positive integer.");
            }

            var existing = await _systemSettingRepository.GetSystemSettingByKeyAsync(createDto.SettingKey);
            if (existing != null)
            {
                throw new Exception("A system setting with this key already exists.");
            }

            var systemSetting = _mapper.Map<SystemSetting>(createDto);
            systemSetting.UpdatedAt = DateTime.UtcNow;

            await _systemSettingRepository.CreateSystemSettingAsync(systemSetting);

            return _mapper.Map<SystemSettingDTO>(systemSetting);
        }

        public async Task<SystemSettingDTO> UpdateSystemSettingAsync(string key, UpdateSystemSettingDTO updateDto)
        {
            if (!key.StartsWith("FREE_USER_"))
            {
                throw new Exception("Update restricted to free user settings.");
            }

            if (!int.TryParse(updateDto.SettingValue, out int value) || value <= 0)
            {
                throw new Exception("Setting value must be a positive integer.");
            }

            var systemSetting = await _systemSettingRepository.GetSystemSettingByKeyAsync(key);
            if (systemSetting == null)
            {
                throw new Exception("System setting not found.");
            }

            systemSetting.SettingValue = updateDto.SettingValue;
            systemSetting.Description = updateDto.Description ?? systemSetting.Description;
            systemSetting.UpdatedAt = DateTime.UtcNow;

            await _systemSettingRepository.UpdateSystemSettingAsync(systemSetting);

            return _mapper.Map<SystemSettingDTO>(systemSetting);
        }
    }
}