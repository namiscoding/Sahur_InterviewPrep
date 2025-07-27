using System;

namespace InterviewPrep.API.Application.Exceptions
{
    public class DuplicateEmailException : Exception
    {
        public DuplicateEmailException(string email) 
            : base($"A staff account with email '{email}' already exists.")
        {
        }
    }
} 