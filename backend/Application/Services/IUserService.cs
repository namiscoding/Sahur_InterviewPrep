using InterviewPrep.API.Application.DTOs.User;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPrep.API.Application.Services
{
    public interface IUserService
    {
        Task<PagedResult<UserDTO>> GetAllCustomersAsync(string search = null, string status = null, int page = 1, int pageSize = 10);
        Task<UserDetailDTO> GetCustomerDetailsAsync(string id);
        Task<UserDTO> UpdateUserStatusAsync(string id, UpdateUserStatusDTO updateDto);
        Task<UserDTO> UpdateCustomerSubscriptionAsync(string id, UpdateSubscriptionDTO updateDto, string reason);
    }
}