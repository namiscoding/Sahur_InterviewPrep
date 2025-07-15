using InterviewPrep.API.Application.Profiles;
using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Data;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using OfficeOpenXml;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình EPPlus License (cho phiên bản 8.0+)
// Chọn một trong các cách sau:

// Cách 1: Sử dụng cho cá nhân/học tập (non-commercial)
ExcelPackage.License.SetNonCommercialPersonal("Your Name");

// Cách 2: Sử dụng cho tổ chức phi lợi nhuận (non-commercial)
// ExcelPackage.License.SetNonCommercialOrganization("Your Organization Name");

// Cách 3: Sử dụng cho thương mại (cần license key)
// ExcelPackage.License.SetCommercial("Your License Key Here");

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
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IStaffRepository, StaffRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();

// Add Services
builder.Services.AddScoped<IExcelImporterService, ExcelImporterService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IStaffService, StaffService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

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
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT:Secret"]))
    };
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
                          .AllowAnyMethod());
});

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

app.Run();