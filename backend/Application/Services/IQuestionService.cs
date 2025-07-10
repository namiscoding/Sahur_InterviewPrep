
using InterviewPrep.API.Application.DTOs.Question;

namespace InterviewPrep.API.Application.Services
{
    public interface IQuestionService
    {
        Task<IEnumerable<QuestionDTO>> GetAllQuestionsAsync();
    }
}
