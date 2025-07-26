using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.Question
{
    public class UpdateQuestionStatusDTO
    {
        [Required]
        public bool IsActive
        {
            get; set;
        }
    }
}
