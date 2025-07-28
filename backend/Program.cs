using InterviewPrep.API;
using InterviewPrep.API.Application.Profiles;
using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Application.Services.Momo;
using InterviewPrep.API.Application.Util;
using InterviewPrep.API.Data;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OfficeOpenXml;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


// connect momo API
builder.Services.Configure<InterviewPrep.API.Application.Services.Momo.MomoOptionModel>(builder.Configuration.GetSection("MomoAPI"));
builder.Services.AddScoped<IMomoService, MomoService>();

// In program.cs or Startup.cs, add debug-level logging for MoMo-related services
builder.Services.AddLogging(logging =>
{
    logging.AddFilter("InterviewPrep.API.Application.Services.Momo.MomoOptionModel", LogLevel.Debug);
    logging.AddFilter("InterviewPrep.API.Controllers.PaymentController", LogLevel.Debug);
    // Add console for development environment
    logging.AddConsole();
    logging.AddDebug();
});

// Cách 1: Sử dụng cho cá nhân/học tập (non-commercial)
ExcelPackage.License.SetNonCommercialPersonal("Your Name");

var configuration = builder.Configuration;

// 1. Cấu hình DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("MyCnn")));

// 2. Cấu hình ASP.NET Core Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Cấu hình các quy tắc cho mật khẩu, người dùng...
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Add Repositories
builder.Services.AddScoped<ITagRepository, TagRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IStaffRepository, StaffRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<ITagRepository, TagRepository>();
builder.Services.AddScoped<IMockSessionRepository, MockSessionRepository>();
builder.Services.AddScoped<ISessionAnswerRepository, SessionAnswerRepository>();
builder.Services.AddScoped<JwtTokenGenerator>();
builder.Services.AddScoped<ISubscriptionPlanRepository, SubscriptionPlanRepository>();
builder.Services.AddScoped<IUserAdminDashboardRepository, UserAdminDashboardRepository>();
builder.Services.AddScoped<ISystemAdminDashboardRepository, SystemAdminDashboardRepository>();
builder.Services.AddScoped<IUserAdminRepository, UserAdminRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ISystemSettingRepository, SystemSettingRepository>();

// Add Services
builder.Services.AddScoped<ISessionAnswerService, SessionAnswerService>();
builder.Services.AddScoped<IExcelImporterService, ExcelImporterService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IMockSessionService, MockSessionService>();
builder.Services.AddSingleton<ISystemSettingsService, SystemSettingsService>();
builder.Services.AddScoped<IPracticeService, PracticeService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ISubscriptionPlanService, SubscriptionPlanService>();
builder.Services.AddScoped<IAiService, OpenAiService>();
builder.Services.AddScoped<IUserAdminService, UserAdminService>();
builder.Services.AddScoped<ITransactionAdminService, TransactionAdminService>();
builder.Services.AddScoped<ISystemSettingService, SystemSettingService>();
builder.Services.AddScoped<IUserAdminDashboardService, UserAdminDashboardService>();
builder.Services.AddScoped<ISystemAdminDashboardService, SystemAdminDashboardService>();
builder.Services.AddScoped<SeedAccountHelper>();
// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// 3. Cấu hình Authorization Services (bắt buộc)
builder.Services.AddAuthorization();

// 4. Cấu hình Authentication với JWT Bearer
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false; // Chỉ nên là false khi dev
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = configuration["JWT:ValidAudience"],
        ValidIssuer = configuration["JWT:ValidIssuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:Secret"])),
        RoleClaimType = ClaimTypes.Role
    };
}).AddGoogle(options =>
{
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
});

// Thêm Controllers
builder.Services.AddControllers(); // Cần thêm nếu bạn muốn sử dụng Controller MVC/API

// Thêm Swagger/OpenAPI (nếu cần)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Cấu hình CORS (nếu cần thiết cho Frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder.WithOrigins("http://localhost:5173") // Thay đổi nếu Frontend của bạn chạy trên cổng khác
                          .AllowAnyHeader()
                          .AllowAnyMethod().AllowCredentials());

});


// Swagger services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
// 1. Kích hoạt Swagger trong môi trường phát triển
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 2. Chuyển hướng HTTP sang HTTPS
app.UseHttpsRedirection();

// 3. Sử dụng CORS policy
app.UseCors("AllowSpecificOrigin");

// 4. Sử dụng Authentication và Authorization
// Thứ tự rất quan trọng: UseAuthentication phải trước UseAuthorization
app.UseAuthentication();
app.UseAuthorization();

// 5. Ánh xạ các Controller
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await DbSeeder.SeedDataAsync(services);
}

app.Run();