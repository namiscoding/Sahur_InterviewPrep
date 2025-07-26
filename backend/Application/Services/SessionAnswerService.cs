using AutoMapper;
using InterviewPrep.API.Application.DTOs.MockSession;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Repositories;

namespace InterviewPrep.API.Application.Services
{
    public class SessionAnswerService : ISessionAnswerService
    {
        private readonly ISessionAnswerRepository _sessionAnswerRepository;
        private readonly IMapper _mapper;

        public SessionAnswerService(ISessionAnswerRepository sessionAnswerRepository, IMapper mapper)
        {
            _sessionAnswerRepository = sessionAnswerRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<SessionAnswerDTO>> GetAnswersBySessionIdAsync(long sessionId)
        {
            var answers = await _sessionAnswerRepository.GetAnswersBySessionIdAsync(sessionId);

            // Giả sử bạn có AutoMapper cấu hình mapping từ entity → DTO
            var answerDTOs = _mapper.Map<IEnumerable<SessionAnswerDTO>>(answers);

            return answerDTOs;
        }
    }
}
