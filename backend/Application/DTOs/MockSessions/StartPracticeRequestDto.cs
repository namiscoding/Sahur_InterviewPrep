using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.MockSessions
{
    public class StartPracticeRequestDto
    {
        [Required]
        public long QuestionId { get; set; }
    }
}
