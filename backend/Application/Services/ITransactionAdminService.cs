using InterviewPrep.API.Application.DTOs.Transaction;
using System.Threading.Tasks;

namespace InterviewPrep.API.Application.Services
{
    public interface ITransactionAdminService
    {
        Task<PagedResult<TransactionListDTO>> GetAllTransactionsAsync(TransactionFilterDTO filter);
        Task<TransactionDetailDTO> GetTransactionDetailsAsync(long id);
        Task<TransactionStatisticsDTO> GetTransactionStatisticsAsync(TransactionFilterDTO filter);
    }
}
