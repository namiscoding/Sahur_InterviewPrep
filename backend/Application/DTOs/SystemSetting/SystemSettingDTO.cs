namespace InterviewPrep.API.Application.DTOs.SystemSetting
{
    public class SystemSettingDTO
    {
        public string SettingKey { get; set; }
        public string SettingValue { get; set; }
        public string Description { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
