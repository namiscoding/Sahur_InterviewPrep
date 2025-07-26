using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.MockSessions
{
    public class CreateFullInterviewRequestDto
    {
        [Required]
        public List<int> CategoryIds { get; set; }

        [Required]
        public List<string> DifficultyLevels { get; set; }

        [Required]
        [Range(1, 10)] 
        public int NumberOfQuestions { get; set; }
    }
}
