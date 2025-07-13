namespace InterviewPrep.API.Application.DTOs.User
{
    public class RevokedToken
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Jti { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
    }
}
