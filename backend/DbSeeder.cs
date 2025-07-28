using InterviewPrep.API.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API
{
    public static class DbSeeder
    {
        public static async Task SeedDataAsync(IServiceProvider serviceProvider)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var context = serviceProvider.GetRequiredService<ApplicationDbContext>(); 

            // --- 1. Seed Roles và Users (như cũ) ---
            await SeedRolesAndUsers(userManager, roleManager);
            await SeedSystemSettings(context);
            // --- 2. Seed Categories, Tags, và Questions ---
            // Chỉ seed nếu chưa có câu hỏi nào
            if (!await context.Questions.AnyAsync())
            {
                await SeedQuestionData(context, userManager);
            }
        }

        private static async Task SeedRolesAndUsers(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            // --- Seed Roles ---
            if (!await roleManager.RoleExistsAsync("UserAdmin")) await roleManager.CreateAsync(new IdentityRole("UserAdmin"));
            if (!await roleManager.RoleExistsAsync("Staff")) await roleManager.CreateAsync(new IdentityRole("Staff"));
            if (!await roleManager.RoleExistsAsync("Customer")) await roleManager.CreateAsync(new IdentityRole("Customer"));
            if (!await roleManager.RoleExistsAsync("SystemAdmin")) await roleManager.CreateAsync(new IdentityRole("SystemAdmin"));
            if (!await roleManager.RoleExistsAsync("BusinessAdmin")) await roleManager.CreateAsync(new IdentityRole("BusinessAdmin"));

            // --- Seed UserAdmin Account ---
            string userAdminEmail = "useradmin@gmail.com";
            var userAdmin = await userManager.FindByEmailAsync(userAdminEmail);
            if (userAdmin == null)
            {
                var newUserAdmin = new ApplicationUser
                {
                    UserName = userAdminEmail,
                    Email = userAdminEmail,
                    DisplayName = "User Admin",
                    EmailConfirmed = true
                };
                var result = await userManager.CreateAsync(newUserAdmin, "Admin@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newUserAdmin, "UserAdmin");
                }
            }

            // --- Seed SystemAdmin Account ---
            string systemAdminEmail = "systemadmin@gmail.com";
            var systemAdmin = await userManager.FindByEmailAsync(systemAdminEmail);
            if (systemAdmin == null)
            {
                var newSystemAdmin = new ApplicationUser
                {
                    UserName = systemAdminEmail,
                    Email = systemAdminEmail,
                    DisplayName = "System Admin",
                    EmailConfirmed = true
                };
                var result = await userManager.CreateAsync(newSystemAdmin, "Admin@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newSystemAdmin, "SystemAdmin");
                }
            }

            // --- Seed BusinessAdmin Account ---
            string businessAdminEmail = "businessadmin@gmail.com";
            var businessAdmin = await userManager.FindByEmailAsync(businessAdminEmail);
            if (businessAdmin == null)
            {
                var newBusinessAdmin = new ApplicationUser
                {
                    UserName = businessAdminEmail,
                    Email = businessAdminEmail,
                    DisplayName = "Business Admin",
                    EmailConfirmed = true
                };
                var result = await userManager.CreateAsync(newBusinessAdmin, "Admin@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newBusinessAdmin, "BusinessAdmin");
                }
            }

            // ... bạn có thể thêm các user khác như Staff, Customer ở đây nếu cần ...
        }

        private static async Task SeedQuestionData(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            // Lấy một user để làm người tạo câu hỏi
            var creator = await userManager.FindByEmailAsync("staff@example.com");
            if (creator == null) return; // Dừng lại nếu không tìm thấy user

            // --- Tạo Categories ---
            var catCSharp = new Category { Name = "Lập trình C#", Description = "Các câu hỏi về ngôn ngữ C# và .NET" };
            var catOOP = new Category { Name = "OOP", Description = "Các câu hỏi về Lập trình Hướng đối tượng" };
            var catDb = new Category { Name = "Cơ sở dữ liệu", Description = "Các câu hỏi về SQL, NoSQL và thiết kế CSDL" };

            context.Categories.AddRange(catCSharp, catOOP, catDb);
            await context.SaveChangesAsync(); // Lưu để lấy ID

            // --- Tạo Tags ---
            var tagBackend = new Tag { Name = "Backend", Slug = "backend" };
            var tagAlgorithm = new Tag { Name = "Thuật toán", Slug = "algorithm" };
            var tagBasic = new Tag { Name = "Cơ bản", Slug = "basic" };

            context.Tags.AddRange(tagBackend, tagAlgorithm, tagBasic);
            await context.SaveChangesAsync(); // Lưu để lấy ID

            // --- Tạo Questions và liên kết ---
            var questions = new List<Question>
            {
                new Question
                {
                    Content = "SOLID là gì? Giải thích từng nguyên tắc.",
                    SampleAnswer = "SOLID là viết tắt của 5 nguyên tắc thiết kế hướng đối tượng...",
                    DifficultyLevel = Data.Models.Enums.DifficultyLevel.Medium,
                    CreatedBy = creator.Id,
                    QuestionCategories = new List<QuestionCategory> { new QuestionCategory { Category = catOOP } },
                    QuestionTags = new List<QuestionTag> { new QuestionTag { Tag = tagBackend }, new QuestionTag { Tag = tagBasic } }
                },
                new Question
                {
                    Content = "Sự khác biệt giữa `var`, `dynamic` và `object` trong C#?",
                    SampleAnswer = "`var` được xác định kiểu lúc biên dịch, `object` là kiểu cơ sở, `dynamic` xác định kiểu lúc chạy...",
                    DifficultyLevel = Data.Models.Enums.DifficultyLevel.Easy,
                    CreatedBy = creator.Id,
                    QuestionCategories = new List<QuestionCategory> { new QuestionCategory { Category = catCSharp } },
                    QuestionTags = new List<QuestionTag> { new QuestionTag { Tag = tagBasic } }
                },
                new Question
                {
                    Content = "Sự khác biệt giữa INNER JOIN và LEFT JOIN là gì?",
                    SampleAnswer = "INNER JOIN trả về các hàng khi có sự trùng khớp ở cả hai bảng. LEFT JOIN trả về tất cả các hàng từ bảng bên trái...",
                    DifficultyLevel = Data.Models.Enums.DifficultyLevel.Easy,
                    CreatedBy = creator.Id,
                    QuestionCategories = new List<QuestionCategory> { new QuestionCategory { Category = catDb } },
                    QuestionTags = new List<QuestionTag> { new QuestionTag { Tag = tagBackend } }
                }
            };

            context.Questions.AddRange(questions);
            await context.SaveChangesAsync();
        }
        private static async Task SeedSystemSettings(ApplicationDbContext context)
        {
            // Chỉ seed nếu chưa có key nào tồn tại
            if (!await context.SystemSettings.AnyAsync(s => s.SettingKey == "FreeUser.SingleQuestion.DailyLimit"))
            {
                context.SystemSettings.Add(new SystemSetting
                {
                    SettingKey = "FreeUser.SingleQuestion.DailyLimit",
                    SettingValue = "5",
                    Description = "Số lượt luyện tập câu hỏi đơn tối đa mỗi ngày cho tài khoản miễn phí."
                });
            }

            if (!await context.SystemSettings.AnyAsync(s => s.SettingKey == "FreeUser.FullSession.DailyLimit"))
            {
                context.SystemSettings.Add(new SystemSetting
                {
                    SettingKey = "FreeUser.FullSession.DailyLimit",
                    SettingValue = "2",
                    Description = "Số lượt làm bài phỏng vấn đầy đủ tối đa mỗi ngày cho tài khoản miễn phí."
                });
            }

            await context.SaveChangesAsync();
        }
    }

}
