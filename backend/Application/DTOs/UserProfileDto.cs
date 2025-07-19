namespace InterviewPrep.API.Application.DTOs
{
    public class UserProfileDto
    {
        public string Id { get; set; }
        public string? DisplayName { get; set; }
        public int SubscriptionLevel { get; set; } // Sử dụng int để khớp với frontend
        public string? SubscriptionExpiryDate { get; set; }
    }
}
