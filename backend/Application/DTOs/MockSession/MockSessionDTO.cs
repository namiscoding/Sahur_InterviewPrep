using InterviewPrep.API.Data.Models.Enums;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Application.DTOs.User;
using InterviewPrep.API.Application.Util;
using InterviewPrep.API.Application.DTOs.Question;

namespace InterviewPrep.API.Application.DTOs.MockSession
{
    public class MockSessionDTO
    {
        public long Id { get; set; }
        public string UserId { get; set; }


        public SessionType SessionType { get; set; }
        public int NumberOfQuestions { get; set; }
        public SessionStatus Status { get; set; }
        public string StatusName => EnumExtensions.GetDisplayName(Status);
        public decimal? OverallScore { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }


    public class SessionAnswerDTO
    {
        public long Id { get; set; }
        public long SessionId { get; set; }
        public long QuestionId { get; set; }
        public int QuestionOrder { get; set; }
        public QuestionDTO Question { get; set; }
        public string? UserAnswer { get; set; }
        public decimal? Score { get; set; }
        public string? Feedback { get; set; }
        public DateTime? AnsweredAt { get; set; }

    

    }

}