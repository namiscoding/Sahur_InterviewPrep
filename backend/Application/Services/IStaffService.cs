using InterviewPrep.API.Application.DTOs.Staff;
using System.Threading.Tasks;

namespace InterviewPrep.API.Application.Services
{
    public interface IStaffService
    {
        Task<PagedResult<StaffDTO>> GetAllStaffAsync(string search = null, string status = null, int page = 1, int pageSize = 10);
        Task<StaffDTO> GetStaffByIdAsync(string id);
        Task<StaffDTO> CreateStaffAsync(CreateStaffDTO createDto);
        Task<StaffDTO> UpdateStaffStatusAsync(string id, UpdateStaffStatusDTO updateDto);
        Task<string> ResetStaffPasswordAsync(string id);
    }
}