using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.SystemSetting
{
    public class UpdateSystemSettingDTO
    {
        [Required]
        public string SettingValue { get; set; }

        public string? Description { get; set; }
    }
}
