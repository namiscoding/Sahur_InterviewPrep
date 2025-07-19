using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using InterviewPrep.API.Data.Models.Enums;

namespace InterviewPrep.API.Data.Models
{
    public class Transaction
    {
        [Key]
        public long Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }

        [Required]
        public int SubscriptionPlanId { get; set; } // Changed to SubscriptionPlanId

        [ForeignKey("SubscriptionPlanId")]
        public virtual SubscriptionPlan SubscriptionPlan { get; set; } // Changed to SubscriptionPlan

        [Required]
        [StringLength(255)]
        public string TransactionCode { get; set; }

        [StringLength(255)]
        public string? GatewayTransactionId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(10)]
        public string Currency { get; set; }

        [Required]
        public TransactionStatus Status { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        public DateTime UpdatedAt { get; set; }

        public string? ExternalTransactionId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string PaymentMethod { get; set; }
    }
}