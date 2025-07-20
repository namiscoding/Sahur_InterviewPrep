using AutoMapper;
using InterviewPrep.API.Application.DTOs.UserAdmin;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace InterviewPrep.API.Application.Services
{
    public class UserAdminService : IUserAdminService
    {
        private readonly IUserAdminRepository _userAdminRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailService _emailService;

        public UserAdminService(
            IUserAdminRepository userAdminRepository,
            UserManager<ApplicationUser> userManager,
            IMapper mapper,
            IAuditLogService auditLogService,
            IHttpContextAccessor httpContextAccessor,
            IEmailService emailService)
        {
            _userAdminRepository = userAdminRepository;
            _userManager = userManager;
            _mapper = mapper;
            _auditLogService = auditLogService;
            _httpContextAccessor = httpContextAccessor;
            _emailService = emailService;
        }

        public async Task<PagedResult<UserAdminDTO>> GetAllUserAdminsAsync(string search = null, string status = null, int page = 1, int pageSize = 10)
        {
            var (userAdmins, total) = await _userAdminRepository.GetAllUserAdminsAsync(search, status, page, pageSize);
            var dtos = _mapper.Map<IEnumerable<UserAdminDTO>>(userAdmins);
            return new PagedResult<UserAdminDTO>
            {
                Items = dtos,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<UserAdminDTO> GetUserAdminByIdAsync(string id)
        {
            var userAdmin = await _userAdminRepository.GetUserAdminByIdAsync(id);
            if (userAdmin == null) return null;
            return _mapper.Map<UserAdminDTO>(userAdmin);
        }

        public async Task<UserAdminDTO> CreateUserAdminAsync(CreateUserAdminDTO createDto)
        {
            var existingUser = await _userManager.FindByEmailAsync(createDto.Email);
            if (existingUser != null)
            {
                throw new Exception("A user admin account with this email already exists.");
            }

            var tempPassword = GenerateTempPassword();

            var userAdmin = new ApplicationUser
            {
                UserName = createDto.Email,
                Email = createDto.Email,
                DisplayName = createDto.DisplayName
            };

            var result = await _userManager.CreateAsync(userAdmin, tempPassword);
            if (!result.Succeeded)
            {
                var messages = result.Errors.Select(e => e.Description);
                throw new Exception(string.Join("; ", messages));
            }

            await _userManager.AddToRoleAsync(userAdmin, "UserAdmin");

            var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
            await _auditLogService.LogActionAsync(userAdmin.Id, $"Created new user admin account: {userAdmin.Email}", ip);

            await _emailService.SendEmailAsync(
                userAdmin.Email,
                "Your InterviewPrep User Admin Account Created",
                $@"
            <p>Hi {userAdmin.DisplayName},</p>
            <p>Your user admin account has been successfully created.</p>
            <p><strong>Email:</strong> {userAdmin.Email}</p>
            <p><strong>Temporary Password:</strong> {tempPassword}</p>
            <p>Please <a href='http://localhost:5173/login'>login</a> and change your password immediately.</p>
            <br/>
            <p>Thanks,<br/>InterviewPrep Team</p>"
            );

            return _mapper.Map<UserAdminDTO>(userAdmin);
        }

        public async Task<UserAdminDTO> UpdateUserAdminStatusAsync(string id, UpdateUserAdminStatusDTO updateDto)
        {
            var userAdmin = await _userAdminRepository.GetUserAdminByIdAsync(id);
            if (userAdmin == null) return null;

            var oldStatus = userAdmin.Status.ToString();
            _mapper.Map(updateDto, userAdmin);
            await _userAdminRepository.UpdateUserAdminAsync(userAdmin);

            var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
            await _auditLogService.LogActionAsync(id, $"Updated user admin status from {oldStatus} to {userAdmin.Status}", ip);

            return _mapper.Map<UserAdminDTO>(userAdmin);
        }

        public async Task<string> ResetUserAdminPasswordAsync(string id)
        {
            var userAdmin = await _userManager.FindByIdAsync(id);
            if (userAdmin == null)
                throw new Exception("User admin not found");

            var tempPassword = GenerateTempPassword();
            var token = await _userManager.GeneratePasswordResetTokenAsync(userAdmin);
            var result = await _userManager.ResetPasswordAsync(userAdmin, token, tempPassword);

            if (!result.Succeeded)
            {
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
            await _auditLogService.LogActionAsync(id, $"Reset password for user admin: {userAdmin.Email}", ip);

            await _emailService.SendEmailAsync(
                userAdmin.Email,
                "Your InterviewPrep User Admin Password Has Been Reset",
                $@"
            <p>Hi {userAdmin.DisplayName},</p>
            <p>Your password has been successfully reset.</p>
            <p><strong>New Temporary Password:</strong> {tempPassword}</p>
            <p>Please <a href='http://localhost:5173/login'>login</a> and change your password immediately.</p>
            <br/>
            <p>Thanks,<br/>InterviewPrep Team</p>"
            );

            return tempPassword;
        }

        private string GenerateTempPassword()
        {
            return Guid.NewGuid().ToString().Substring(0, 8) + "!Aa1";
        }
    }
}