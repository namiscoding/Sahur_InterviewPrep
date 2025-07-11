using InterviewPrep.API.Application.DTOs.Question;

namespace InterviewPrep.API.Application.Services
{
    public interface IExcelImporterService
    {
        Task<IEnumerable<QuestionDTO>> ImportQuestionsFromExcelAsync(Stream fileStream, string createdByUserId);
    }
}
