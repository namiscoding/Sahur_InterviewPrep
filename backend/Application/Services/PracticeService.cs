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

        public PracticeService(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            IHttpContextAccessor httpContextAccessor,
            ISystemSettingsService settingsService)
        {
            _context = context;
            _userManager = userManager;
            _httpContextAccessor = httpContextAccessor;
            _settingsService = settingsService;
        }

        public async Task<(MockSession? Session, string? ErrorMessage)> StartSingleQuestionPracticeAsync(long questionId)
        {
            var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return (null, "User is not authenticated.");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return (null, "User not found.");

            // 1. KIỂM TRA GIỚI HẠN NẾU LÀ USER FREE
            if (user.SubscriptionLevel == SubscriptionLevel.Free)
            {
                var dailyLimit = _settingsService.GetValue<int>("FREE_USER_QUESTION_DAILY_LIMIT", 5);
                var todayStart = DateTime.UtcNow.Date;

                // THAY ĐỔI LOGIC: Đếm số UsageLog đã được ghi trong ngày
                var usageCount = await _context.UsageLogs
                    .CountAsync(log =>
                        log.UserId == userId &&
                        log.ActionType == "CompleteSingleQuestion" && // Đếm action hoàn thành
                        log.UsageTimestamp >= todayStart);

                if (usageCount >= dailyLimit)
                {
                    return (null, $"You have reached your daily limit of {dailyLimit} completed practice sessions.");
                }
            }

            // 2. TẠO SESSION NHƯNG KHÔNG GHI USAGELOG
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

        // --- PHƯƠNG THỨC MỚI ĐỂ HOÀN THÀNH VÀ GHI LOG ---
        public async Task<(SubmitAnswerResponseDto? Result, string? ErrorMessage)> SubmitAnswerAndCompleteSingleQuestionAsync(long sessionId, string userAnswer)
        {
            // 1. Tìm phiên làm việc và câu trả lời tương ứng
            var session = await _context.MockSessions
                .Include(s => s.SessionAnswers)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null) return (null, "Session not found.");

            var sessionAnswer = session.SessionAnswers.FirstOrDefault();
            if (sessionAnswer == null) return (null, "Session answer record not found.");

            // 2. Lưu câu trả lời của người dùng
            sessionAnswer.UserAnswer = userAnswer;
            sessionAnswer.AnsweredAt = DateTime.UtcNow;

            // 3. (Giả lập) Chấm điểm và tạo feedback
            // Trong thực tế, bạn sẽ gọi AI hoặc một logic phức tạp hơn ở đây
            var score = 50;
            var feedback = new FeedbackDto
            {
                Overall = "Phân tích tốt!",
                Strengths = new List<string> { "Cấu trúc rõ ràng." },
                Improvements = new List<string> { "Nên thêm ví dụ." }
            };

            // Lưu kết quả chấm điểm
            sessionAnswer.Score = score;
            sessionAnswer.Feedback = JsonSerializer.Serialize(feedback);

            // 4. Cập nhật trạng thái phiên và thời gian hoàn thành
            session.Status = SessionStatus.Completed;
            session.CompletedAt = DateTime.UtcNow;
            session.OverallScore = score;

            // 5. QUAN TRỌNG: GHI USAGELOG TẠI THỜI ĐIỂM HOÀN THÀNH
            var usageLog = new UsageLog
            {
                UserId = session.UserId,
                ActionType = "CompleteSingleQuestion", // Tên action mới
                UsageTimestamp = DateTime.UtcNow
            };
            await _context.UsageLogs.AddAsync(usageLog);

            // 6. Lưu tất cả thay đổi
            await _context.SaveChangesAsync();

            // 7. Trả về kết quả cho người dùng
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

            // 1. Kiểm tra giới hạn nếu là user miễn phí
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

            // 2. Logic lựa chọn câu hỏi
            var query = _context.Questions.Where(q => q.IsActive).AsQueryable();

            // Lọc theo Category (nếu người dùng có chọn)
            if (request.CategoryIds != null && request.CategoryIds.Any())
            {
                query = query.Where(q => q.QuestionCategories.Any(qc => request.CategoryIds.Contains(qc.CategoryId)));
            }

            if (request.DifficultyLevels != null && request.DifficultyLevels.Any())
            {
                // Chuyển đổi danh sách string sang danh sách enum
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
                    // Lọc các câu hỏi có DifficultyLevel nằm trong danh sách đã chọn
                    query = query.Where(q => difficultiesAsEnum.Contains(q.DifficultyLevel));
                }
            }
            // Lấy ngẫu nhiên số lượng câu hỏi mong muốn
            var selectedQuestions = await _context.Questions
                                    .FromSqlRaw($"SELECT TOP ({request.NumberOfQuestions}) * FROM Questions ORDER BY NEWID()")
                                    .ToListAsync();

            if (selectedQuestions.Count < request.NumberOfQuestions)
            {
                return (null, "Could not find enough questions matching your criteria. Please try a broader selection.");
            }

            // 3. Tạo MockSession và các SessionAnswer tương ứng
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

            // Nạp lại dữ liệu câu hỏi để trả về cho client
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
            // 1. Tìm đúng câu trả lời cần cập nhật
            var sessionAnswer = await _context.SessionAnswers
                .FirstOrDefaultAsync(sa => sa.SessionId == sessionId && sa.QuestionId == request.QuestionId);

            if (sessionAnswer == null)
            {
                return (null, "Could not find the specified question in this session.");
            }

            // 2. Cập nhật câu trả lời và thời gian
            sessionAnswer.UserAnswer = request.UserAnswer;
            sessionAnswer.AnsweredAt = DateTime.UtcNow;

            // --- BẮT ĐẦU PHẦN MOCK FEEDBACK ---

            // 1. Tạo một feedback giả có cấu trúc
            var mockFeedback = new FeedbackDto
            {
                Overall = "Đây là nhận xét chung được tạo tự động.",
                Strengths = new List<string> { "Điểm mạnh giả 1: Trình bày tốt.", "Điểm mạnh giả 2: Đúng trọng tâm." },
                Improvements = new List<string> { "Điểm yếu giả 1: Cần thêm ví dụ.", "Điểm yếu giả 2: Phân tích chưa sâu." }
            };

            // 2. Tạo một điểm số giả
            var mockScore = (decimal)(new Random().Next(70, 95)); // Ngẫu nhiên từ 7.0 đến 9.5

            // 3. Cập nhật vào bản ghi SessionAnswer
            sessionAnswer.Score = mockScore;
            sessionAnswer.Feedback = JsonSerializer.Serialize(mockFeedback);

            // --- KẾT THÚC PHẦN MOCK FEEDBACK ---

            await _context.SaveChangesAsync();

            return (sessionAnswer, null);
        }


        public async Task<(MockSession? Session, string? ErrorMessage)> CompleteFullMockInterviewAsync(long sessionId)
        {
            var session = await _context.MockSessions
                .Include(s => s.SessionAnswers)
                .FirstOrDefaultAsync(s => s.Id == sessionId);

            if (session == null)
            {
                return (null, "Session not found.");
            }

            // 1. Cập nhật trạng thái và thời gian hoàn thành
            session.Status = SessionStatus.Completed;
            session.CompletedAt = DateTime.UtcNow;

            // 2. (Tùy chọn) Tính điểm tổng thể dựa trên các câu trả lời
            if (session.SessionAnswers.Any(sa => sa.Score.HasValue))
            {
                session.OverallScore = session.SessionAnswers.Average(sa => sa.Score);
            }

            // 3. QUAN TRỌNG: Ghi UsageLog khi hoàn thành
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
