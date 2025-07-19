using System.Collections.Concurrent;
using System.Runtime;

namespace InterviewPrep.API.Application.Services
{
    public class SystemSettingsService : ISystemSettingsService
    {
        private readonly ConcurrentDictionary<string, string> _settings;
        public SystemSettingsService(IServiceProvider serviceProvider)
        {
            // 2. Tạo một scope tạm thời để lấy các service scoped
            using (var scope = serviceProvider.CreateScope())
            {
                // 3. Lấy DbContext từ scope tạm thời này
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                // Tải tất cả settings từ DB vào cache như cũ
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
                    // Cố gắng chuyển đổi sang kiểu dữ liệu mong muốn (int, bool...)
                    return (T)Convert.ChangeType(value, typeof(T));
                }
                catch
                {
                    return defaultValue; // Nếu lỗi, trả về giá trị mặc định
                }
            }
            return defaultValue;
        }
    }
}
