using System.Collections.Concurrent;
using System.Runtime;

namespace InterviewPrep.API.Application.Services
{
    public class SystemSettingsService : ISystemSettingsService
    {
        private readonly ConcurrentDictionary<string, string> _settings;
        public SystemSettingsService(IServiceProvider serviceProvider)
        {
            using (var scope = serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                _settings = new ConcurrentDictionary<string, string>(
                    context.SystemSettings.ToDictionary(s => s.SettingKey, s => s.SettingValue)
                );
            }
        }

        public T GetValue<T>(string key, T defaultValue)
        {
            if (_settings.TryGetValue(key, out var value))
            {
                try
                {
                    return (T)Convert.ChangeType(value, typeof(T));
                }
                catch
                {
                    return defaultValue; 
                }
            }
            return defaultValue;
        }
    }
}
