using AutoMapper;
using InterviewPrep.API.Application.DTOs.User;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;
using InterviewPrep.API.Data.Repositories;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPrep.API.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserService(IUserRepository userRepository, IMapper mapper, IAuditLogService auditLogService, IHttpContextAccessor httpContextAccessor)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _auditLogService = auditLogService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<PagedResult<UserDTO>> GetAllCustomersAsync(string search = null, string status = null, int page = 1, int pageSize = 10)
        {
            var (users, total) = await _userRepository.GetAllCustomersAsync(search, status, page, pageSize);
            var dtos = _mapper.Map<IEnumerable<UserDTO>>(users);
            return new PagedResult<UserDTO>
            {
                Items = dtos,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<UserDetailDTO> GetCustomerDetailsAsync(string id)
        {
            var user = await _userRepository.GetCustomerByIdAsync(id);
            if (user == null) return null;
            return _mapper.Map<UserDetailDTO>(user);
        }

        public async Task<UserDTO> UpdateUserStatusAsync(string id, UpdateUserStatusDTO updateDto)
        {
            var user = await _userRepository.GetCustomerByIdAsync(id);
            if (user == null) return null;

            var oldStatus = user.Status.ToString();
            _mapper.Map(updateDto, user);
            await _userRepository.UpdateUserAsync(user);

            var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
            await _auditLogService.LogActionAsync(id, $"Updated customer status from {oldStatus} to {user.Status}", ip); // Audit log added

            return _mapper.Map<UserDTO>(user);
        }

        public async Task<UserDTO> UpdateCustomerSubscriptionAsync(string id, UpdateSubscriptionDTO updateDto, string reason)
        {
            var user = await _userRepository.GetCustomerByIdAsync(id);
            if (user == null) return null;

            var oldLevel = user.SubscriptionLevel.ToString();
            var oldExpiry = user.SubscriptionExpiryDate;

            // Convert string to enum SubscriptionLevel
            if (!Enum.TryParse<SubscriptionLevel>(updateDto.SubscriptionLevel, true, out var parsedLevel))
            {
                throw new ArgumentException("Invalid subscription level.");
            }

            user.SubscriptionLevel = parsedLevel;

            if (parsedLevel == SubscriptionLevel.Premium)
            {
                if (user.SubscriptionLevel == SubscriptionLevel.Free)
                {
                    user.SubscriptionExpiryDate = DateTime.UtcNow.AddMonths(1);
                }
                else if (user.SubscriptionLevel == SubscriptionLevel.Premium)
                {
                    user.SubscriptionExpiryDate = (user.SubscriptionExpiryDate ?? DateTime.UtcNow).AddMonths(1);
                }
            }
            else if (parsedLevel == SubscriptionLevel.Free)
            {
                user.SubscriptionExpiryDate = null;
            }

            await _userRepository.UpdateUserAsync(user);

            var ip = _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
            await _auditLogService.LogActionAsync(id,
                $"Updated customer subscription from {oldLevel} (expiry: {oldExpiry}) to {user.SubscriptionLevel} (expiry: {user.SubscriptionExpiryDate}). Reason: {reason}",
                ip);

            return _mapper.Map<UserDTO>(user);
        }

    }
}