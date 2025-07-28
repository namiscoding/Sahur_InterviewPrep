using AutoMapper;
using InterviewPrep.API.Application.DTOs.Transaction;
using InterviewPrep.API.Data.Repositories;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InterviewPrep.API.Application.Services
{
    public class TransactionAdminService : ITransactionAdminService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAuditLogService _auditLogService;

        public TransactionAdminService(
            ITransactionRepository transactionRepository,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IAuditLogService auditLogService)
        {
            _transactionRepository = transactionRepository;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _auditLogService = auditLogService;
        }

        public async Task<PagedResult<TransactionListDTO>> GetAllTransactionsAsync(TransactionFilterDTO filter)
        {
            var (transactions, total) = await _transactionRepository.GetAllTransactionsAsync(filter);
            var dtos = _mapper.Map<IEnumerable<TransactionListDTO>>(transactions);

            return new PagedResult<TransactionListDTO>
            {
                Items = dtos,
                TotalCount = total,
                Page = filter.Page,
                PageSize = filter.PageSize
            };
        }

        public async Task<TransactionDetailDTO> GetTransactionDetailsAsync(long id)
        {
            var transaction = await _transactionRepository.GetTransactionByIdAsync(id);
            if (transaction == null) return null;

            return _mapper.Map<TransactionDetailDTO>(transaction);
        }

        public async Task<TransactionStatisticsDTO> GetTransactionStatisticsAsync(TransactionFilterDTO filter)
        {
            var statistics = await _transactionRepository.GetTransactionStatisticsAsync(filter);

            return statistics;
        }
    }
}
