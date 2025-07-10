using AutoMapper;
using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            
            CreateMap<Category, CategoryDTO>();
        }
    }
}
