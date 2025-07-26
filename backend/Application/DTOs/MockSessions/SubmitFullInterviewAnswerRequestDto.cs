using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.MockSessions
{
    public class SubmitFullInterviewAnswerRequestDto
    {
        [Required]
        public long QuestionId { get; set; }

        [Required]
        public string UserAnswer { get; set; }
    }
}
