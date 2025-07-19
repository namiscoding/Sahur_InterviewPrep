using InterviewPrep.API.Application.DTOs.User;

namespace InterviewPrep.API.Application.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<LoginResultDto> LoginAsync(LoginDto dto);
        Task<UserDto> UpdateProfileAsync(string userId, UpdateProfileDto dto);
        Task<UserWithDetailsDto> GetCurrentUserWithDetailsAsync(string userId);
        Task SendResetPasswordTokenAsync(ForgotPasswordDto dto);
        Task ResetPasswordAsync(ResetPasswordDto dto);
       
    }
}
