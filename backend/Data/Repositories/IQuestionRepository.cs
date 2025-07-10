using InterviewPrep.API.Models;

namespace InterviewPrep.API.Data.Repositories
{
    public interface IQuestionRepository
    {
        Task<IEnumerable<Question>> GetAllQuestionsAsync();
    }
}
