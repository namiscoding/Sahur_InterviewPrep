using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Data.Repositories
{
    public interface ITagRepository
    {
        Task<IEnumerable<Tag>> GetAllTagsAsync();
        
    }
}
