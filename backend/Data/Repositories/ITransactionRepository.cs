using InterviewPrep.API.Application.DTOs.Transaction;
using InterviewPrep.API.Data.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPrep.API.Data.Repositories
{
    public interface ITransactionRepository
    {
        Task<(IEnumerable<Transaction> Transactions, int Total)> GetAllTransactionsAsync(TransactionFilterDTO filter);
        Task<Transaction> GetTransactionByIdAsync(long id);
        Task<TransactionStatisticsDTO> GetTransactionStatisticsAsync(TransactionFilterDTO filter);
    }
}
