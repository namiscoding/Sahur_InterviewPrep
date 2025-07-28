using InterviewPrep.API.Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace InterviewPrep.API.Application.Services
{
    public class SeedAccountHelper
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        
        // Cache cho seed accounts để tránh query database nhiều lần
        private static Dictionary<string, string> _seedAccountCache = new Dictionary<string, string>();

        public SeedAccountHelper(UserManager<ApplicationUser> userManager, IHttpContextAccessor httpContextAccessor)
        {
            _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Lấy UserId của current user, ưu tiên từ seed accounts
        /// </summary>
        public async Task<string> GetCurrentUserIdAsync()
        {
            // Lấy thông tin user từ JWT token
            var jwtUserId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUserEmail = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value ??
                                  _httpContextAccessor.HttpContext?.User?.FindFirst("email")?.Value;
            var currentUserName = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value;

            // Trước tiên, thử với JWT userId trực tiếp (cho các seed accounts đã đăng nhập)
            if (!string.IsNullOrEmpty(jwtUserId))
            {
                return jwtUserId;
            }

            // Nếu có email trong JWT, kiểm tra xem có phải seed account không
            if (!string.IsNullOrEmpty(currentUserEmail))
            {
                var seedUserId = await GetSeedAccountUserIdAsync(currentUserEmail);
                if (!string.IsNullOrEmpty(seedUserId))
                {
                    return seedUserId;
                }
            }

            // Nếu có username trong JWT, kiểm tra xem có phải seed account không
            if (!string.IsNullOrEmpty(currentUserName))
            {
                var seedUserId = await GetSeedAccountUserIdAsync(currentUserName);
                if (!string.IsNullOrEmpty(seedUserId))
                {
                    return seedUserId;
                }
            }

            // Fallback về null nếu không tìm thấy
            return null;
        }

        /// <summary>
        /// Lấy UserId từ email của seed accounts
        /// </summary>
        private async Task<string> GetSeedAccountUserIdAsync(string email)
        {
            // Kiểm tra cache trước
            if (_seedAccountCache.ContainsKey(email))
            {
                return _seedAccountCache[email];
            }

            // Danh sách các seed accounts
            var seedEmails = new[]
            {
                "systemadmin@gmail.com",
                "useradmin@gmail.com", 
                "businessadmin@gmail.com"
            };

            if (seedEmails.Contains(email.ToLower()))
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user != null)
                {
                    // Cache kết quả
                    _seedAccountCache[email] = user.Id;
                    return user.Id;
                }
            }

            return null;
        }

        /// <summary>
        /// Lấy thông tin seed account chi tiết
        /// </summary>
        public async Task<SeedAccountInfo> GetSeedAccountInfoAsync(string email)
        {
            var seedAccounts = new Dictionary<string, SeedAccountInfo>
            {
                { "systemadmin@gmail.com", new SeedAccountInfo { DisplayName = "System Admin", Email = "systemadmin@gmail.com", Role = "SystemAdmin" } },
                { "useradmin@gmail.com", new SeedAccountInfo { DisplayName = "User Admin", Email = "useradmin@gmail.com", Role = "UserAdmin" } },
                { "businessadmin@gmail.com", new SeedAccountInfo { DisplayName = "Business Admin", Email = "businessadmin@gmail.com", Role = "BusinessAdmin" } }
            };

            if (seedAccounts.ContainsKey(email.ToLower()))
            {
                var seedInfo = seedAccounts[email.ToLower()];
                seedInfo.UserId = await GetSeedAccountUserIdAsync(email);
                return seedInfo;
            }

            return null;
        }

        /// <summary>
        /// Kiểm tra xem user hiện tại có phải seed account không
        /// </summary>
        public async Task<bool> IsCurrentUserSeedAccountAsync()
        {
            var currentUserEmail = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;
            var currentUserName = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value;

            if (!string.IsNullOrEmpty(currentUserEmail))
            {
                return await GetSeedAccountInfoAsync(currentUserEmail) != null;
            }

            if (!string.IsNullOrEmpty(currentUserName))
            {
                return await GetSeedAccountInfoAsync(currentUserName) != null;
            }

            return false;
        }
    }

    public class SeedAccountInfo
    {
        public string UserId { get; set; }
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }
} 