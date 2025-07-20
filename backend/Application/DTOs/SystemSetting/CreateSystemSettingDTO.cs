using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.SystemSetting
{
    public class CreateSystemSettingDTO
    {
        [Required]
        public string SettingKey { get; set; }

        [Required]
        public string SettingValue { get; set; }

        public string? Description { get; set; }
    }
}
