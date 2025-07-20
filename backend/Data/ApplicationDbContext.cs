using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;

// Đảm bảo bạn đã có các model này trong project, ví dụ: using YourProject.Models;

// DbContext kế thừa từ IdentityDbContext, sử dụng ApplicationUser và IdentityRole với khóa chính kiểu string
public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // KHÔNG cần khai báo: DbSet<ApplicationUser>, DbSet<IdentityRole>
    // IdentityDbContext đã tự động quản lý chúng.

    // Khai báo DbSet cho các model nghiệp vụ của bạn
    #region DbSets
    // Nhóm Nội dung
    public DbSet<Category> Categories { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<QuestionCategory> QuestionCategories { get; set; }
    public DbSet<QuestionTag> QuestionTags { get; set; }

    // Nhóm Hoạt động & Kinh doanh
    public DbSet<MockSession> MockSessions { get; set; }
    public DbSet<SessionAnswer> SessionAnswers { get; set; }
    public DbSet<UsageLog> UsageLogs { get; set; }
    public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
    public DbSet<Transaction> Transactions { get; set; }

    // Nhóm Hệ thống
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<SystemSetting> SystemSettings { get; set; }
    #endregion


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Phải gọi base.OnModelCreating(modelBuilder) ĐẦU TIÊN
        // để Identity có thể cấu hình schema của nó.
        base.OnModelCreating(modelBuilder);

        // =================================================================
        // CẤU HÌNH CHO CÁC THUỘC TÍNH TÙY CHỈNH CỦA APPLICATIONUSER
        // =================================================================
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            // Các bảng của Identity (AspNetUsers, AspNetRoles,...) được tự động đặt tên.
            // Ở đây ta chỉ cấu hình các trường tùy chỉnh đã thêm vào.
            entity.Property(e => e.DisplayName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).HasDefaultValue(UserStatus.Active);
            entity.Property(e => e.SubscriptionLevel).HasDefaultValue(SubscriptionLevel.Free);

            // Đã xóa trường DeletedAt và QueryFilter tương ứng theo yêu cầu.
        });


        // =================================================================
        // NHÓM NỘI DUNG
        // =================================================================

        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("Categories");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            // Mối quan hệ với ApplicationUser
            // Lưu ý: CreatedBy trong model Category phải là kiểu 'string?'
            entity.HasOne(e => e.Creator)
                  .WithMany(u => u.CreatedCategories)
                  .HasForeignKey(e => e.CreatedBy)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.ToTable("Tags");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.ToTable("Questions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.DifficultyLevel);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.UsageCount).HasDefaultValue(0);

            // Mối quan hệ với ApplicationUser
            // Lưu ý: CreatedBy trong model Question phải là kiểu 'string'
            entity.HasOne(e => e.Creator)
                  .WithMany(u => u.CreatedQuestions)
                  .HasForeignKey(e => e.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<QuestionCategory>(entity =>
        {
            entity.ToTable("QuestionCategories");
            entity.HasKey(e => new { e.QuestionId, e.CategoryId });
            entity.HasOne(e => e.Question).WithMany(q => q.QuestionCategories).HasForeignKey(e => e.QuestionId);
            entity.HasOne(e => e.Category).WithMany(c => c.QuestionCategories).HasForeignKey(e => e.CategoryId);
        });

        modelBuilder.Entity<QuestionTag>(entity =>
        {
            entity.ToTable("QuestionTags");
            entity.HasKey(e => new { e.QuestionId, e.TagId });
            entity.HasOne(e => e.Question).WithMany(q => q.QuestionTags).HasForeignKey(e => e.QuestionId);
            entity.HasOne(e => e.Tag).WithMany(t => t.QuestionTags).HasForeignKey(e => e.TagId);
        });

        // =================================================================
        // NHÓM HOẠT ĐỘNG & KINH DOANH
        // =================================================================

        modelBuilder.Entity<MockSession>(entity =>
        {
            entity.ToTable("MockSessions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OverallScore).HasColumnType("decimal(5, 0)");

            // Lưu ý: UserId trong model MockSession phải là kiểu 'string'
            entity.HasOne(e => e.User)
                  .WithMany(u => u.MockSessions)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SessionAnswer>(entity =>
        {
            entity.ToTable("SessionAnswers");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Score).HasColumnType("decimal(5, 0)");
            entity.HasOne(e => e.MockSession).WithMany(s => s.SessionAnswers).HasForeignKey(e => e.SessionId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.Question).WithMany(q => q.SessionAnswers).HasForeignKey(e => e.QuestionId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<UsageLog>(entity =>
        {
            entity.ToTable("UsageLogs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ActionType).IsRequired().HasMaxLength(50);

            // Lưu ý: UserId trong model UsageLog phải là kiểu 'string'
            entity.HasOne(e => e.User)
                  .WithMany(u => u.UsageLogs)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SubscriptionPlan>(entity =>
        {
            entity.ToTable("SubscriptionPlans");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Price).IsRequired().HasColumnType("decimal(10, 0)");
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(3);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.ToTable("Transactions");
            entity.HasKey(e => e.Id);

            // Cấu hình các thuộc tính
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.SubscriptionPlanId).IsRequired();
            entity.Property(e => e.TransactionCode).IsRequired().HasMaxLength(255);
            entity.Property(e => e.GatewayTransactionId).HasMaxLength(255);
            entity.Property(e => e.Amount).IsRequired().HasColumnType("decimal(10, 0)");
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.UpdatedAt).IsRequired();
            entity.Property(e => e.PaymentMethod).HasMaxLength(50);

            // Cấu hình các mối quan hệ
            entity.HasOne(e => e.User)
                .WithMany(u => u.Transactions) // Giả sử ApplicationUser có ICollection<Transaction> Transactions
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.SubscriptionPlan)
                .WithMany(p => p.Transactions) // Giả sử SubscriptionPlan có ICollection<Transaction> Transactions
                .HasForeignKey(e => e.SubscriptionPlanId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =================================================================
        // NHÓM HỆ THỐNG
        // =================================================================

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("AuditLogs");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(255);
            entity.Property(e => e.IpAddress).HasMaxLength(45);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            // Lưu ý: UserId trong model AuditLog phải là kiểu 'string?'
            entity.HasOne(e => e.User).WithMany(u => u.AuditLogs).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.ToTable("SystemSettings");
            entity.HasKey(e => e.SettingKey);
            entity.Property(e => e.SettingKey).HasMaxLength(100);
            entity.Property(e => e.SettingValue).IsRequired();
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
        });
    }
}