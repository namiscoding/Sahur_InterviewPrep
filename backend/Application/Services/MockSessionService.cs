using AutoMapper;
using InterviewPrep.API.Application.DTOs.MockSession;
using InterviewPrep.API.Data.Repositories;

namespace InterviewPrep.API.Application.Services
{
    public class MockSessionService : IMockSessionService

    {
        private readonly IMockSessionRepository _repository;
        private readonly IMapper _mapper;

        public MockSessionService(IMockSessionRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<MockSessionDTO>> GetUserSessionsAsync(string userId)
        {
            var sessions = await _repository.GetSessionsByUserIdAsync(userId);
            return _mapper.Map<List<MockSessionDTO>>(sessions);
        }
    }
}