using AutoMapper;
using InterviewPrep.API.Application.DTOs.Audit;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.DTOs.Question;
using InterviewPrep.API.Application.DTOs.Staff;
using InterviewPrep.API.Application.DTOs.User;
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;

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
            CreateMap<ApplicationUser, UserDTO>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.SubscriptionLevel, opt => opt.MapFrom(src => src.SubscriptionLevel.ToString()));

            CreateMap<ApplicationUser, UserDetailDTO>()
                .IncludeBase<ApplicationUser, UserDTO>();

            CreateMap<Transaction, TransactionDTO>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            CreateMap<MockSession, MockSessionDTO>()
                .ForMember(dest => dest.SessionType, opt => opt.MapFrom(src => src.SessionType.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            CreateMap<UsageLog, UsageLogDTO>();
            CreateMap<UpdateSubscriptionDTO, ApplicationUser>()
                .ForMember(dest => dest.SubscriptionLevel, opt => opt.MapFrom(src => Enum.Parse<SubscriptionLevel>(src.SubscriptionLevel)));
            CreateMap<UpdateUserStatusDTO, ApplicationUser>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Enum.Parse<UserStatus>(src.Status)));
            CreateMap<ApplicationUser, StaffDTO>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            CreateMap<UpdateStaffStatusDTO, ApplicationUser>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Enum.Parse<UserStatus>(src.Status)));
            CreateMap<AuditLog, AuditLogDTO>();
        }
    }
}
