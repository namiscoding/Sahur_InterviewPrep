using Microsoft.AspNetCore.Mvc;
using InterviewPrep.API.Application.Services;
using InterviewPrep.API.Application.DTOs.Transaction;
using System.Threading.Tasks;

namespace InterviewPrep.API.Controllers
{
    [Route("api/systemadmin/transactions")]
    [ApiController]
    //[Authorize(Roles = "SystemAdmin")]
    public class SystemAdminTransactionsController : ControllerBase
    {
        private readonly ITransactionAdminService _transactionAdminService;

        public SystemAdminTransactionsController(ITransactionAdminService transactionAdminService)
        {
            _transactionAdminService = transactionAdminService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<TransactionListDTO>>> GetAllTransactions([FromQuery] TransactionFilterDTO filter)
        {
            var result = await _transactionAdminService.GetAllTransactionsAsync(filter);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionDetailDTO>> GetTransactionDetails(long id)
        {
            var transaction = await _transactionAdminService.GetTransactionDetailsAsync(id);
            if (transaction == null) return NotFound();
            return Ok(transaction);
        }
    }
}
