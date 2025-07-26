namespace InterviewPrep.API.Application.DTOs.User
{
    public class UserDTO
    {
        public string Id { get; set; }
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string Status { get; set; }
        public string SubscriptionLevel { get; set; }
        public DateTime? SubscriptionExpiryDate { get; set; }
    }
}
