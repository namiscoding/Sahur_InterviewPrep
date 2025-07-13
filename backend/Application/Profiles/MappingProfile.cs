using AutoMapper;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.DTOs.Question;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Repositories;

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
            CreateMap<Question, QuestionDTO>();
            CreateMap<CreateQuestionDTO, Question>()
                .ForMember(dest => dest.UsageCount, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.QuestionCategories, opt => opt.Ignore())
                .ForMember(dest => dest.QuestionTags, opt => opt.Ignore());

            CreateMap<UpdateQuestionInfoDTO, Question>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UsageCount, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore())
                .ForMember(dest => dest.QuestionCategories, opt => opt.Ignore())
                .ForMember(dest => dest.QuestionTags, opt => opt.Ignore());
            CreateMap<CategoryUsageTrend, CategoryUsageTrendDTO>();
        }
    }
}
