using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.MockSessions
{
    public class SubmitAnswerRequestDto
    {
        [Required]
        public string UserAnswer { get; set; }
    }
}
