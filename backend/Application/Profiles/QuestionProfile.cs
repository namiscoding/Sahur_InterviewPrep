using AutoMapper;
using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Data.Models;

namespace InterviewPrep.API.Application.Profiles
{
    public class QuestionProfile : Profile
    {
        public QuestionProfile()
        {
            // Map từ Category -> CategoryDto
            CreateMap<Category, CategoryForCustomerDto>();
            // Map từ Tag -> TagDto
            CreateMap<Tag, TagForCustomerDTO>();

            // Map từ Question -> QuestionForCustomerDto
            CreateMap<Question, QuestionForCustomerDto>()
                .ForMember(dest => dest.Categories, opt =>
                    opt.MapFrom(src => src.QuestionCategories.Select(qc => qc.Category)))
                .ForMember(dest => dest.Tags, opt =>
                    opt.MapFrom(src => src.QuestionTags.Select(qt => qt.Tag)));
        }
    }
}
