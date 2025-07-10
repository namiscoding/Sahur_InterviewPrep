using InterviewPrep.API.Data.Models;
using Microsoft.AspNetCore.Identity;

namespace InterviewPrep.API
{
    public static class DbSeeder
    {
        // Phương thức này sẽ được gọi từ Program.cs
        public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
        {
            // Lấy các service cần thiết thông qua Dependency Injection
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            // --- Tạo các Roles (Customer, Staff, Admin) ---
            // Kiểm tra và tạo Role "Admin" nếu chưa tồn tại
            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole("Admin"));
            }
            // Kiểm tra và tạo Role "Staff" nếu chưa tồn tại
            if (!await roleManager.RoleExistsAsync("Staff"))
            {
                await roleManager.CreateAsync(new IdentityRole("Staff"));
            }
            // Kiểm tra và tạo Role "Customer" nếu chưa tồn tại
            if (!await roleManager.RoleExistsAsync("Customer"))
            {
                await roleManager.CreateAsync(new IdentityRole("Customer"));
            }


            // --- Tạo tài khoản Admin ---
            string adminEmail = "admin@example.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                var newAdminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    DisplayName = "Admin User",
                    EmailConfirmed = true // Xác thực email luôn để test cho dễ
                };
                // Tạo user với mật khẩu
                var result = await userManager.CreateAsync(newAdminUser, "Admin@123");

                // Nếu tạo thành công, gán Role "Admin" cho user này
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newAdminUser, "Admin");
                }
            }

            // --- Tạo tài khoản Staff ---
            string staffEmail = "staff@example.com";
            var staffUser = await userManager.FindByEmailAsync(staffEmail);
            if (staffUser == null)
            {
                var newStaffUser = new ApplicationUser { UserName = staffEmail, Email = staffEmail, DisplayName = "Staff User", EmailConfirmed = true };
                var result = await userManager.CreateAsync(newStaffUser, "Staff@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newStaffUser, "Staff");
                }
            }

            // --- Tạo tài khoản Customer ---
            string customerEmail = "customer@example.com";
            var customerUser = await userManager.FindByEmailAsync(customerEmail);
            if (customerUser == null)
            {
                var newCustomerUser = new ApplicationUser { UserName = customerEmail, Email = customerEmail, DisplayName = "Customer User", EmailConfirmed = true };
                var result = await userManager.CreateAsync(newCustomerUser, "Customer@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newCustomerUser, "Customer");
                }
            }
        }
    }

}
