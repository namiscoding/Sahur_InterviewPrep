using InterviewPrep.API.Application.DTOs.Business;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InterviewPrep.API.Application.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        public AnalyticsService(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<UserEngagementDto> GetUserEngagementMetricsAsync(DateTime? startDate, DateTime? endDate)
        {
            var effectiveEndDate = endDate?.ToUniversalTime() ?? DateTime.UtcNow;
            var effectiveStartDate = startDate?.ToUniversalTime() ?? effectiveEndDate.AddDays(-7);

            var activeUsers = await _context.MockSessions
                .Where(s => s.StartedAt >= effectiveStartDate && s.StartedAt <= effectiveEndDate)
                .Select(s => s.UserId)
                .Distinct()
                .CountAsync();

            var sessionsStarted = await _context.MockSessions
                .CountAsync(s => s.StartedAt >= effectiveStartDate && s.StartedAt <= effectiveEndDate);

            var sessionsCompleted = await _context.MockSessions
                .CountAsync(s => s.Status == SessionStatus.Completed &&
                                 s.CompletedAt >= effectiveStartDate &&
                                 s.CompletedAt <= effectiveEndDate);

            double completionRate = (sessionsStarted > 0)
                ? ((double)sessionsCompleted / sessionsStarted) * 100
                : 0;

            var completedSessionsQuery = _context.MockSessions
                .Where(s => s.Status == SessionStatus.Completed &&
                             s.CompletedAt.HasValue &&
                             s.CompletedAt >= effectiveStartDate &&
                             s.CompletedAt <= effectiveEndDate);

            double averageDuration = await completedSessionsQuery.AnyAsync()
                ? await completedSessionsQuery.AverageAsync(s => EF.Functions.DateDiffSecond(s.StartedAt, s.CompletedAt.Value))
                : 0;
            var rawDailyData = await _context.MockSessions
                    .Where(s => s.StartedAt >= effectiveStartDate && s.StartedAt <= effectiveEndDate)
                    .GroupBy(s => s.StartedAt.Date) 
                    .Select(g => new
                    {
                        Date = g.Key, 
                        ActiveUsers = g.Select(s => s.UserId).Distinct().Count()
                    })
                    .OrderBy(d => d.Date)
                    .ToListAsync(); 

            var dailyActiveUsers = rawDailyData
                .Select(d => new DailyDataPoint
                {
                    Date = d.Date.ToString("dd/MM"), 
                    ActiveUsers = d.ActiveUsers
                })
                .ToList();
            return new UserEngagementDto
            {
                StartDate = effectiveStartDate,
                EndDate = effectiveEndDate,
                ActiveUsers = activeUsers,
                SessionsStarted = sessionsStarted,
                SessionsCompleted = sessionsCompleted,
                CompletionRate = Math.Round(completionRate, 2),
                AverageSessionDurationSeconds = Math.Round(averageDuration, 0),
                DailyActiveUsers = dailyActiveUsers
            };
        }

        public async Task<IEnumerable<StaffPerformanceDto>> GetStaffPerformanceAsync(DateTime? startDate, DateTime? endDate, string? staffId)
        {
            var effectiveEndDate = endDate?.ToUniversalTime() ?? DateTime.UtcNow;
            var effectiveStartDate = startDate?.ToUniversalTime() ?? effectiveEndDate.AddDays(-30);

            var staffUsers = await _userManager.GetUsersInRoleAsync("Staff");

            if (!string.IsNullOrEmpty(staffId))
            {
                staffUsers = staffUsers.Where(s => s.Id == staffId).ToList();
            }

            var result = new List<StaffPerformanceDto>();

            foreach (var staff in staffUsers)
            {
                var questionIds = await _context.Questions
                    .Where(q => q.CreatedBy == staff.Id)
                    .Select(q => q.Id)
                    .ToListAsync();

                var questionsCreated = await _context.Questions
                    .CountAsync(q => q.CreatedBy == staff.Id && q.CreatedAt >= effectiveStartDate && q.CreatedAt <= effectiveEndDate);

                var totalUsage = await _context.Questions
                    .Where(q => q.CreatedBy == staff.Id)
                    .SumAsync(q => q.UsageCount);

                var relevantAnswers = _context.SessionAnswers
                    .Where(sa => questionIds.Contains(sa.QuestionId) && sa.Score.HasValue);

                decimal? averageScore = await relevantAnswers.AnyAsync()
                    ? await relevantAnswers.AverageAsync(sa => sa.Score)
                    : (decimal?)null;

                result.Add(new StaffPerformanceDto
                {
                    StaffId = staff.Id,
                    StaffName = staff.DisplayName,
                    StaffEmail = staff.Email,
                    QuestionsCreated = questionsCreated,
                    TotalQuestionUsage = totalUsage,
                    AverageScoreOnQuestions = averageScore.HasValue ? Math.Round(averageScore.Value, 2) : null
                });
            }

            return result.OrderByDescending(r => r.TotalQuestionUsage).ToList();
        }
    }
}
