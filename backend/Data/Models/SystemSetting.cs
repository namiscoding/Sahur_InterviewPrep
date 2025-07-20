namespace InterviewPrep.API.Data.Models
{
    public class SystemSetting
    {
        public string SettingKey { get; set; }
        public string SettingValue { get; set; }
        public string? Description { get; set; }
        public DateTime UpdatedAt { get; set; }
    }   
}
