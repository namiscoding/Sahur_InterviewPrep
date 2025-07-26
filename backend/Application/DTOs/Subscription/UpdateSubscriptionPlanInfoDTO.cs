using InterviewPrep.API.Data.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Application.DTOs.Subscription
{
    public class UpdateSubscriptionPlanInfoDTO
    {
        [Required(ErrorMessage = "Name is required.")]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
        public string Name { get; set; }

        public SubscriptionLevel Level { get; set; } 

        [Required(ErrorMessage = "Duration in months is required.")]
        [Range(1, 120, ErrorMessage = "Duration must be between 1 and 120 months.")]
        public int DurationMonths { get; set; }

        [Required(ErrorMessage = "Price is required.")]
        [Range(0.00, 1000000.00, ErrorMessage = "Price must be greater than 5.000 VND.")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Currency is required.")]
        [StringLength(3, MinimumLength = 3, ErrorMessage = "Currency must be 3 characters (e.g., VND).")]
        public string Currency { get; set; }
    }
}
