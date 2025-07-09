using AutoMapper;
using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Models;

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
