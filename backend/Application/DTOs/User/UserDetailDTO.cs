using System.Collections.Generic;

namespace InterviewPrep.API.Application.DTOs.User
{
    public class UserDetailDTO : UserDTO
    {
        public IEnumerable<TransactionDTO> Transactions { get; set; }
        public IEnumerable<MockSessionDTO> MockSessions { get; set; }
        public IEnumerable<UsageLogDTO> UsageLogs { get; set; }
    }

    public class TransactionDTO
    {
        public long Id { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class MockSessionDTO
    {
        public long Id { get; set; }
        public string SessionType { get; set; }
        public string Status { get; set; }
        public DateTime StartedAt { get; set; }
    }

    public class UsageLogDTO
    {
        public long Id { get; set; }
        public string ActionType { get; set; }
        public DateTime UsageTimestamp { get; set; }
    }
}