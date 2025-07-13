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

                 // Chuyển đổi enum DifficultyLevel sang kiểu string để hiển thị
                 .ForMember(
                     dest => dest.DifficultyLevel,
                     opt => opt.MapFrom(src => src.DifficultyLevel.ToString())
                 )

                 // Map danh sách Categories từ bảng nối QuestionCategories
                 // AutoMapper sẽ tự động dùng map "Category -> CategoryDto" đã định nghĩa ở trên
                 .ForMember(
                     dest => dest.Categories,
                     opt => opt.MapFrom(src => src.QuestionCategories.Select(qc => qc.Category))
                 )

                 // Map danh sách Tags từ bảng nối QuestionTags
                 // AutoMapper sẽ tự động dùng map "Tag -> TagDto" đã định nghĩa ở trên
                 .ForMember(
                     dest => dest.Tags,
                     opt => opt.MapFrom(src => src.QuestionTags.Select(qt => qt.Tag))
                 );
        }
    }
}
