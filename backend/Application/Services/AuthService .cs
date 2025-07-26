using InterviewPrep.API.Application.DTOs.User;
using InterviewPrep.API.Application.Util;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;
using InterviewPrep.API.Data.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly JwtTokenGenerator _jwtTokenGenerator;
        private readonly IAuthRepository _userRepository;

        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;
        public AuthService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            JwtTokenGenerator jwtTokenGenerator, IAuthRepository userRepository, IEmailService emailService, IConfiguration config)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtTokenGenerator = jwtTokenGenerator;
            _userRepository = userRepository;
            _emailService = emailService;
            _config = config;
        }

        public async Task<UserWithDetailsDto> GetCurrentUserWithDetailsAsync(string userId)
        {
            var user = await _userRepository.GetByIdWithDetailsAsync(userId);
            if (user == null)
                throw new Exception("Not found User");

            return new UserWithDetailsDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Status = user.Status,
                SubscriptionLevel = user.SubscriptionLevel,
                SubscriptionExpiryDate = user.SubscriptionExpiryDate
              
        };
        }

        public async Task<LoginResultDto> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.Users
                .Include(u => u.CreatedCategories)
                .Include(u => u.CreatedQuestions)
                .Include(u => u.MockSessions)
                .Include(u => u.UsageLogs)
                .Include(u => u.AuditLogs)
                .FirstOrDefaultAsync(u =>
                    u.Email == dto.EmailOrUserName || u.UserName == dto.EmailOrUserName);

            if (user == null)
                throw new Exception("The account does not exist.");

            var valid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!valid)
                throw new Exception("Password does not correct.");

            var roles = await _userManager.GetRolesAsync(user);
            var token = _jwtTokenGenerator.GenerateToken(user, roles);

            var userDto = new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email!,
                DisplayName = user.DisplayName,
                Status = user.Status,
                SubscriptionLevel = user.SubscriptionLevel,
                SubscriptionExpiryDate = user.SubscriptionExpiryDate
            };

            return new LoginResultDto
            {
                Token = token,
                User = userDto
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            const string defaultRole = "User";

            if (await _userManager.FindByEmailAsync(dto.Email) != null)
                throw new Exception("Email existed");

            if (await _userManager.FindByNameAsync(dto.UserName) != null)
                throw new Exception("The Username existed");

            var user = new ApplicationUser
            {
                UserName = dto.UserName,
                Email = dto.Email,
                DisplayName = dto.DisplayName,
                Status = UserStatus.Active,
                SubscriptionLevel = SubscriptionLevel.Free
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));

            if (!await _roleManager.RoleExistsAsync(defaultRole))
                await _roleManager.CreateAsync(new IdentityRole(defaultRole));

            await _userManager.AddToRoleAsync(user, defaultRole);
            var roles = await _userManager.GetRolesAsync(user);

            var token = _jwtTokenGenerator.GenerateToken(user, roles);

            return new AuthResponseDto
            {
                Token = token,
                Message = "Đăng ký thành công",
                User = new UserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email!,
                    DisplayName = user.DisplayName,
                    Status = user.Status,
                    SubscriptionLevel = user.SubscriptionLevel,
                    SubscriptionExpiryDate = user.SubscriptionExpiryDate
                }
            };
        }
    

    public async Task<UserDto> UpdateProfileAsync(string userId, UpdateProfileDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                throw new Exception("Người dùng không tồn tại.");

            // Kiểm tra username/email nếu thay đổi
            if (!string.IsNullOrEmpty(dto.UserName) && dto.UserName != user.UserName)
            {
                if (await _userManager.FindByNameAsync(dto.UserName) != null)
                    throw new Exception("The Username existed");
                user.UserName = dto.UserName;
            }

            if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Email)
            {
                if (await _userManager.FindByEmailAsync(dto.Email) != null)
                    throw new Exception("The email has been used");
                user.Email = dto.Email;
            }

            if (!string.IsNullOrEmpty(dto.DisplayName))
                user.DisplayName = dto.DisplayName;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));

            return new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email!,
                DisplayName = user.DisplayName,
                Status = user.Status,
                SubscriptionLevel = user.SubscriptionLevel,
                SubscriptionExpiryDate = user.SubscriptionExpiryDate
            };
        }
        public async Task SendResetPasswordTokenAsync(ForgotPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.EmailOrUserName);
            if (user == null) return;

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = Uri.EscapeDataString(token);

            var resetUrl = $"{_config["Frontend:ResetPasswordUrl"]}?email={user.Email}&token={encodedToken}";

            var html = $@"
            <p>Chào {user.DisplayName},</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào liên kết dưới đây để tiếp tục:</p>
            <p><a href='{resetUrl}'>Đặt lại mật khẩu</a></p>
            <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>";

            await _emailService.SendEmailAsync(user.Email, "Đặt lại mật khẩu", html);
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                throw new Exception("Not found User");

            var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
            if (!result.Succeeded)
                throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));
        }

    }
}