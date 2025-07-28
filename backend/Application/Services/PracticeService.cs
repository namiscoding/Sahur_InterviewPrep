using InterviewPrep.API.Data.Models.Enums;
using InterviewPrep.API.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InterviewPrep.API.Application.DTOs.MockSessions;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace InterviewPrep.API.Application.Services
{
    public class PracticeService : IPracticeService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ISystemSettingsService _settingsService;
        private readonly IAiService _aiService;

        public PracticeService(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            IHttpContextAccessor httpContextAccessor,
            ISystemSettingsService settingsService,
            IAiService aiService)
        {
            _context = context;
            _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
            _settingsService = settingsService;
            _aiService = aiService;
        }

        public async Task<(MockSession? Session, string? ErrorMessage)> StartSingleQuestionPracticeAsync(long questionId)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return (null, "User is not authenticated.");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return (null, "User not found.");

            if (user.SubscriptionLevel == SubscriptionLevel.Free)
            {
                var dailyLimit = _settingsService.GetValue<int>("FREE_USER_QUESTION_DAILY_LIMIT", 5);
                var todayStart = DateTime.UtcNow.Date;

                var usageCount = await _context.UsageLogs
                    .CountAsync(log =>
                        log.UserId == userId &&
                        log.ActionType == "CompleteSingleQuestion" && 
                        log.UsageTimestamp >= todayStart);

                if (usageCount >= dailyLimit)
                {
                    return (null, $"You have reached your daily limit of {dailyLimit} completed practice sessions.");
                }
            }

            var question = await _context.Questions.FindAsync(questionId);
            if (question == null) return (null, "Question not found.");

            var newSession = new MockSession
            {
                UserId = userId,
                Status = SessionStatus.InProgress,
                SessionType = SessionType.SingleQuestion,
                StartedAt = DateTime.UtcNow,
                NumberOfQuestions = 1
            };
            newSession.SessionAnswers.Add(new SessionAnswer { Question = question, QuestionOrder = 1 });

            await _context.MockSessions.AddAsync(newSession);
            await _context.SaveChangesAsync();

            return (newSession, null);
        }

        public async Task<(SubmitAnswerResponseDto? Result, string? ErrorMessage)> SubmitAnswerAndCompleteSingleQuestionAsync(long sessionId, string userAnswer)
        {
            var session = await _context.MockSessions
                                .Include(s => s.SessionAnswers)
                                    .ThenInclude(sa => sa.Question) 
                                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null) return (null, "Session not found.");

            var sessionAnswer = session.SessionAnswers.FirstOrDefault();
            if (sessionAnswer == null) return (null, "Session answer record not found.");

            sessionAnswer.UserAnswer = userAnswer;
            sessionAnswer.AnsweredAt = DateTime.UtcNow;

            var (feedback, score) = await _aiService.GetFeedbackForAnswerAsync(sessionAnswer.Question.Content, userAnswer);

            sessionAnswer.Score = score;
            sessionAnswer.Feedback = JsonSerializer.Serialize(feedback);

            session.Status = SessionStatus.Completed;
            session.CompletedAt = DateTime.UtcNow;
            session.OverallScore = score;
            var question = sessionAnswer.Question;
            if (question != null)
            {
                question.UsageCount++;
            }
            var usageLog = new UsageLog
            {
                UserId = session.UserId,
                ActionType = "CompleteSingleQuestion", 
                UsageTimestamp = DateTime.UtcNow
            };
            await _context.UsageLogs.AddAsync(usageLog);
            await _context.SaveChangesAsync();
            var resultDto = new SubmitAnswerResponseDto
            {
                SessionAnswerId = sessionAnswer.Id,
                Score = score,
                Feedback = feedback
            };
            return (resultDto, null);
        }

        public async Task<(MockSession? Session, string? ErrorMessage)> StartFullMockInterviewAsync(CreateFullInterviewRequestDto request)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return (null, "User is not authenticated.");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return (null, "User not found.");

            if (user.SubscriptionLevel == SubscriptionLevel.Free)
            {
                var dailyLimit = _settingsService.GetValue<int>("FREE_USER_SESSION_DAILY_LIMIT", 2);
                var todayStart = DateTime.UtcNow.Date;

                var usageCount = await _context.UsageLogs
                    .CountAsync(log =>
                        log.UserId == userId &&
                        log.ActionType == "CompleteFullMockInterview" && 
                        log.UsageTimestamp >= todayStart);

                if (usageCount >= dailyLimit)
                {
                    return (null, $"You have reached your daily limit of {dailyLimit} full mock interviews.");
                }
            }
            var query = _context.Questions.Where(q => q.IsActive).AsQueryable();
            if (request.CategoryIds != null && request.CategoryIds.Any())
            {
                query = query.Where(q => q.QuestionCategories.Any(qc => request.CategoryIds.Contains(qc.CategoryId)));
            }

            if (request.DifficultyLevels != null && request.DifficultyLevels.Any())
            {
                var difficultiesAsEnum = new List<DifficultyLevel>();
                foreach (var levelStr in request.DifficultyLevels)
                {
                    if (Enum.TryParse<DifficultyLevel>(levelStr, true, out var parsedDifficulty))
                    {
                        difficultiesAsEnum.Add(parsedDifficulty);
                    }
                }

                if (difficultiesAsEnum.Any())
                {
                    query = query.Where(q => difficultiesAsEnum.Contains(q.DifficultyLevel));
                }
            }
            var selectedQuestions = await query
                                    .OrderBy(q => Guid.NewGuid()) 
                                    .Take(request.NumberOfQuestions) 
                                    .ToListAsync();

            if (selectedQuestions.Count < request.NumberOfQuestions)
            {
                return (null, "Could not find enough questions matching your criteria. Please try a broader selection.");
            }

            var newSession = new MockSession
            {
                UserId = userId,
                Status = SessionStatus.InProgress,
                SessionType = SessionType.MockInterview,
                StartedAt = DateTime.UtcNow,
                NumberOfQuestions = selectedQuestions.Count
            };

            int order = 1;
            foreach (var question in selectedQuestions)
            {
                newSession.SessionAnswers.Add(new SessionAnswer { Question = question, QuestionOrder = order++ });
            }

            await _context.MockSessions.AddAsync(newSession);
            await _context.SaveChangesAsync();

            await _context.Entry(newSession)
                        .Collection(s => s.SessionAnswers)
                        .Query()
                        .Include(sa => sa.Question)
                            .ThenInclude(q => q.QuestionCategories)
                            .ThenInclude(qc => qc.Category)
                        .Include(sa => sa.Question)
                            .ThenInclude(q => q.QuestionTags)
                            .ThenInclude(qt => qt.Tag)
                        .LoadAsync();
            return (newSession, null);
        }
        public async Task<(SessionAnswer? Answer, string? ErrorMessage)> SubmitAnswerForMockInterviewAsync(long sessionId, SubmitFullInterviewAnswerRequestDto request)
        {
            var sessionAnswer = await _context.SessionAnswers
                                    .Include(sa => sa.Question) 
                                    .FirstOrDefaultAsync(sa => sa.SessionId == sessionId && sa.QuestionId == request.QuestionId);

            if (sessionAnswer == null)
            {
                return (null, "Could not find the specified question in this session.");
            }

            sessionAnswer.UserAnswer = request.UserAnswer;
            sessionAnswer.AnsweredAt = DateTime.UtcNow;

            var (feedback, score) = await _aiService.GetFeedbackForAnswerAsync(sessionAnswer.Question.Content, request.UserAnswer);

            sessionAnswer.Score = score;
            sessionAnswer.Feedback = JsonSerializer.Serialize(feedback);

            await _context.SaveChangesAsync();

            return (sessionAnswer, null);
        }


        public async Task<(MockSession? Session, string? ErrorMessage)> CompleteFullMockInterviewAsync(long sessionId)
        {
            var session = await _context.MockSessions
                .Include(s => s.SessionAnswers)
                     .ThenInclude(sa => sa.Question)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null)
            {
                return (null, "Session not found.");
            }

            session.Status = SessionStatus.Completed;
            session.CompletedAt = DateTime.UtcNow;

            if (session.SessionAnswers.Any(sa => sa.Score.HasValue))
            {
                session.OverallScore = session.SessionAnswers.Average(sa => sa.Score);
            }

            foreach (var answer in session.SessionAnswers)
            {
                if (answer.Question != null)
                {
                    answer.Question.UsageCount++;
                }
            }


            var usageLog = new UsageLog
            {
                UserId = session.UserId,
                ActionType = "CompleteFullMockInterview",
                UsageTimestamp = DateTime.UtcNow
            };
            await _context.UsageLogs.AddAsync(usageLog);

            await _context.SaveChangesAsync();

            return (session, null);
        }
        public async Task<MockSession?> GetSessionByIdAsync(long sessionId)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

            var session = await _context.MockSessions
                .Include(s => s.SessionAnswers)
                    .ThenInclude(sa => sa.Question)
                    .ThenInclude(q => q.QuestionCategories)
                    .ThenInclude(qc => qc.Category)
                .Include(s => s.SessionAnswers)
                    .ThenInclude(sa => sa.Question)
                    .ThenInclude(q => q.QuestionTags)
                    .ThenInclude(qt => qt.Tag)
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);

            return session;
        }
        public Task<int> GetLimitAsync(string key, int defaultValue)
        {
            int value = _settingsService.GetValue<int>(key, defaultValue); // <- rõ ràng kiểu int
            return Task.FromResult(value);
        }


        public Task<int> CountUsageAsync(string userId, string actionType, DateTime fromUtc)
        {
            return _context.UsageLogs
                .Where(log => log.UserId == userId &&
                              log.ActionType == actionType &&
                              log.UsageTimestamp >= fromUtc)
                .CountAsync();
        }
    }
}
