using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Application.Services
{
    public interface ITransactionService
    {
        Task<bool> LogTransactionAsync(Transaction transaction);
        Task<List<Transaction>> GetUserTransactionsAsync(string userId);
        Task<Transaction?> GetTransactionByExternalIdAsync(string externalTransactionId);
    }
}
