using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Data.Repositories
{
    public interface IQuestionRepository
    {
        Task<IEnumerable<Question>> GetActiveQuestionsAsync();
    }
}
