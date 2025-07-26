using InterviewPrep.API.Application.DTOs.UserAdmin;
using System.Threading.Tasks;

namespace InterviewPrep.API.Application.Services
{
    public interface IUserAdminService
    {
        Task<PagedResult<UserAdminDTO>> GetAllUserAdminsAsync(string search = null, string status = null, int page = 1, int pageSize = 10);
        Task<UserAdminDTO> GetUserAdminByIdAsync(string id);
        Task<UserAdminDTO> CreateUserAdminAsync(CreateUserAdminDTO createDto);
        Task<UserAdminDTO> UpdateUserAdminStatusAsync(string id, UpdateUserAdminStatusDTO updateDto);
        Task<string> ResetUserAdminPasswordAsync(string id);
    }
}