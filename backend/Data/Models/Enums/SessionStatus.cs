using System.ComponentModel.DataAnnotations;

namespace InterviewPrep.API.Data.Models.Enums
{
    public enum SessionStatus
    {
        [Display(Name = "Completed")]
        Completed = 1,

        [Display(Name = "On Progress")]
        OnProgress = 2
    }
}
