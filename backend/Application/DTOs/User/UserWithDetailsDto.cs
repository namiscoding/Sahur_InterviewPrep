using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.DTOs.Question;
using InterviewPrep.API.Data.Models.Enums;

namespace InterviewPrep.API.Application.DTOs.User
{
    public class UserWithDetailsDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string DisplayName { get; set; }
        public UserStatus Status { get; set; }
        public SubscriptionLevel SubscriptionLevel { get; set; }
        public DateTime? SubscriptionExpiryDate { get; set; }

        
    }

}
