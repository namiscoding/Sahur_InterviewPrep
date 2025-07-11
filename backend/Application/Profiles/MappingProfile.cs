using AutoMapper;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.DTOs.Question;
using InterviewPrep.API.Data.Models;

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
                .ForMember(dest => dest.UsageCount, opt => opt.Ignore()) // UsageCount được set trong repo/service
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore()) // CreatedBy được set trong service
                .ForMember(dest => dest.QuestionCategories, opt => opt.Ignore()) // Xử lý thủ công mối quan hệ
                .ForMember(dest => dest.QuestionTags, opt => opt.Ignore()); // Xử lý thủ công mối quan hệ
           CreateMap<UpdateQuestionInfoDTO, Question>() 
                .ForMember(dest => dest.Id, opt => opt.Ignore()) // ID được truyền qua URL, không phải từ DTO
                .ForMember(dest => dest.UsageCount, opt => opt.Ignore()) // UsageCount không được cập nhật qua đây
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore()) // CreatedBy không được cập nhật qua đây
                .ForMember(dest => dest.IsActive, opt => opt.Ignore()) // IsActive được cập nhật riêng
                .ForMember(dest => dest.QuestionCategories, opt => opt.Ignore()) // Xử lý thủ công mối quan hệ
                .ForMember(dest => dest.QuestionTags, opt => opt.Ignore());
        }
    }
}
