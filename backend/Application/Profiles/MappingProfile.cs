using AutoMapper;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Models;

namespace InterviewPrep.API.Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            
            CreateMap<Category, CategoryDTO>();
            CreateMap<CreateCategoryDTO, Category>();
            CreateMap<UpdateCategoryInfoDTO, Category>();
            CreateMap<UpdateCategoryStatusDTO, Category>();
        }
    }
}
