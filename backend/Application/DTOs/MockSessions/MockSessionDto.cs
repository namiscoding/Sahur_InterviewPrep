using InterviewPrep.API.Application.DTOs.Question;

namespace InterviewPrep.API.Application.DTOs.MockSessions
{
    public class MockSessionDto
    {
        public long Id { get; set; }
        public string Status { get; set; }
        public string SessionType { get; set; }
        public DateTime StartedAt { get; set; }
        public List<QuestionForCustomerDto> Questions { get; set; }
    }

}
