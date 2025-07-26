namespace InterviewPrep.API.Application.Services
{
    public interface ISystemSettingsService
    {
        T GetValue<T>(string key, T defaultValue);
    }
}
