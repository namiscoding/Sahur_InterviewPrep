using InterviewPrep.API.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InterviewPrep.API.Controllers
{
    [Route("api/customer")]
    [ApiController]
    public class SessionAnswerController : ControllerBase
    {
        private readonly ISessionAnswerService _sessionAnswerService;

        public SessionAnswerController(ISessionAnswerService sessionAnswerService)
        {
            _sessionAnswerService = sessionAnswerService;
        }

        [HttpGet("getAnswer/{sessionId}")]
            [Authorize]
        public async Task<IActionResult> GetAnswers(long sessionId)
        {
            var answers = await _sessionAnswerService.GetAnswersBySessionIdAsync(sessionId);
            return Ok(answers);
        }
    }
}
