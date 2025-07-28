// File: Application/Services/StaffService.cs

using AutoMapper;
using InterviewPrep.API.Application.DTOs.Staff;
using InterviewPrep.API.Application.Exceptions;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace InterviewPrep.API.Application.Services
{
    public class StaffService : IStaffService
    {
        private readonly IStaffRepository _staffRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailService _emailService;
        private readonly SeedAccountHelper _seedAccountHelper;

        public StaffService(
            IStaffRepository staffRepository,
            UserManager<ApplicationUser> userManager,
            IMapper mapper,
            IAuditLogService auditLogService,
            IHttpContextAccessor httpContextAccessor,
            IEmailService emailService,
            SeedAccountHelper seedAccountHelper)
        {
            _staffRepository = staffRepository;
            _userManager = userManager;
            _mapper = mapper;
            _auditLogService = auditLogService;
            _httpContextAccessor = httpContextAccessor;
            _emailService = emailService;
            _seedAccountHelper = seedAccountHelper;
        }

        public async Task<PagedResult<StaffDTO>> GetAllStaffAsync(string search = null, string status = null, int page = 1, int pageSize = 10)
        {
            var (staffs, total) = await _staffRepository.GetAllStaffAsync(search, status, page, pageSize);
            var dtos = _mapper.Map<IEnumerable<StaffDTO>>(staffs);
            return new PagedResult<StaffDTO>
            {
                Items = dtos,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<StaffDTO> GetStaffByIdAsync(string id)
        {
            var staff = await _staffRepository.GetStaffByIdAsync(id);
            if (staff == null) return null;
            return _mapper.Map<StaffDTO>(staff);
        }

        public async Task<StaffDTO> CreateStaffAsync(CreateStaffDTO createDto)
        {
            var existingUser = await _userManager.FindByEmailAsync(createDto.Email);
            if (existingUser != null)
            {
                throw new DuplicateEmailException(createDto.Email);
            }

            var tempPassword = GenerateTempPassword();

            var staff = new ApplicationUser
            {
                UserName = createDto.Email,
                Email = createDto.Email,
                DisplayName = createDto.DisplayName
            };

            var result = await _userManager.CreateAsync(staff, tempPassword);
            if (!result.Succeeded)
            {
                var messages = result.Errors.Select(e => e.Description);
                throw new Exception(string.Join("; ", messages));
            }

            await _userManager.AddToRoleAsync(staff, "Staff");

            var currentUserId = await _seedAccountHelper.GetCurrentUserIdAsync();
            var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
            await _auditLogService.LogActionAsync(currentUserId, $"Created new staff account: {staff.DisplayName} ({staff.Email})", ip);

            await _emailService.SendEmailAsync(
                staff.Email,
                "Your InterviewPrep Staff Account Created",
                $@"
            <p>Hi {staff.DisplayName},</p>
            <p>Your staff account has been successfully created.</p>
            <p><strong>Email:</strong> {staff.Email}</p>
            <p><strong>Temporary Password:</strong> {tempPassword}</p>
            <p>Please <a href='http://localhost:5173/login'>login</a> and change your password immediately.</p>
            <br/>
            <p>Thanks,<br/>InterviewPrep Team</p>"
            );

            return _mapper.Map<StaffDTO>(staff);
        }

        public async Task<StaffDTO> UpdateStaffStatusAsync(string id, UpdateStaffStatusDTO updateDto)
        {
            var staff = await _staffRepository.GetStaffByIdAsync(id);
            if (staff == null) return null;

            var oldStatus = staff.Status.ToString();
            _mapper.Map(updateDto, staff);
            await _staffRepository.UpdateStaffAsync(staff);

            var currentUserId = await _seedAccountHelper.GetCurrentUserIdAsync();
            var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
            await _auditLogService.LogActionAsync(currentUserId, $"Updated staff status: {staff.DisplayName} from {oldStatus} to {staff.Status}", ip);

            return _mapper.Map<StaffDTO>(staff);
        }

        public async Task<string> ResetStaffPasswordAsync(string id)
        {
            var staff = await _userManager.FindByIdAsync(id);
            if (staff == null)
                throw new Exception("Staff not found");

            var tempPassword = GenerateTempPassword();
            var token = await _userManager.GeneratePasswordResetTokenAsync(staff);
            var result = await _userManager.ResetPasswordAsync(staff, token, tempPassword);

            if (!result.Succeeded)
            {
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            var currentUserId = await _seedAccountHelper.GetCurrentUserIdAsync();
            var ip = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
            await _auditLogService.LogActionAsync(currentUserId, $"Reset password for staff: {staff.DisplayName} ({staff.Email})", ip);

            await _emailService.SendEmailAsync(
                staff.Email,
                "Your InterviewPrep Staff Password Has Been Reset",
                $@"
            <p>Hi {staff.DisplayName},</p>
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
