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

            // --- 2. Seed Categories, Tags, và Questions ---
            // Chỉ seed nếu chưa có câu hỏi nào
            if (!await context.Questions.AnyAsync())
            {
                await SeedQuestionData(context, userManager);
            }
        }

        private static async Task SeedRolesAndUsers(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            // Code seed roles và user của bạn ở đây...
            if (!await roleManager.RoleExistsAsync("Admin")) await roleManager.CreateAsync(new IdentityRole("Admin"));
            if (!await roleManager.RoleExistsAsync("Staff")) await roleManager.CreateAsync(new IdentityRole("Staff"));
            if (!await roleManager.RoleExistsAsync("Customer")) await roleManager.CreateAsync(new IdentityRole("Customer"));
            // ... v.v cho các user
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
    }

}
