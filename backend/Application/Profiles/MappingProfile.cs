using System.Text.Json;
using AutoMapper;
using InterviewPrep.API.Application.DTOs;
using InterviewPrep.API.Application.DTOs.Audit;
using InterviewPrep.API.Application.DTOs.Category;
using InterviewPrep.API.Application.DTOs.MockSession;
using InterviewPrep.API.Application.DTOs.MockSessions;
using InterviewPrep.API.Application.DTOs.Question;
using InterviewPrep.API.Application.DTOs.Staff;
using InterviewPrep.API.Application.DTOs.Subscription;
using InterviewPrep.API.Application.DTOs.User; // Namespace này có thể chứa TransactionDTO thứ hai
using InterviewPrep.API.Data.Models;
using InterviewPrep.API.Data.Models.Enums;
using InterviewPrep.API.Data.Repositories;

namespace InterviewPrep.API.Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<SessionAnswer, SessionAnswerDTO>()
               .ForMember(dest => dest.Question, opt => opt.MapFrom(src => src.Question));
            CreateMap<MockSession, DTOs.MockSession.MockSessionDTO>();
            CreateMap<Category, CategoryDTO>();
            CreateMap<CreateCategoryDTO, Category>();
            CreateMap<UpdateCategoryInfoDTO, Category>();
            CreateMap<UpdateCategoryStatusDTO, Category>();
            CreateMap<Question, QuestionDTO>()
               .ForMember(dest => dest.Categories, opt => opt.MapFrom(src =>
                          src.QuestionCategories.Select(qc => qc.Category)));
            CreateMap<Category, CategoryDTO>();
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
            CreateMap<ApplicationUser, UserDTO>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.SubscriptionLevel, opt => opt.MapFrom(src => src.SubscriptionLevel.ToString()));

            CreateMap<CategoryUsageTrend, CategoryUsageTrendDTO>();
            CreateMap<CategoryUsageTrendDTO, CategoryUsageTrend>();

            CreateMap<ApplicationUser, UserDetailDTO>()
                .IncludeBase<ApplicationUser, UserDTO>();

            CreateMap<Transaction, InterviewPrep.API.Application.DTOs.Subscription.TransactionDTO>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            CreateMap<MockSession,MockSession>()
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
            CreateMap<MockSession, MockSessionDto>()
               .ForMember(
                   dest => dest.Status,
                   opt => opt.MapFrom(src => src.Status.ToString())
               )
               .ForMember(
                   dest => dest.SessionType,
                   opt => opt.MapFrom(src => src.SessionType.ToString())
               )
               // AutoMapper sẽ tự động dùng map "Question -> QuestionForCustomerDto" đã có
               .ForMember(
                   dest => dest.Questions,
                   opt => opt.MapFrom(src => src.SessionAnswers.Select(sa => sa.Question))
               );

            CreateMap<Question, QuestionDTO>()
            .ForMember(dest => dest.Categories, opt => opt.MapFrom(src =>
                src.QuestionCategories.Select(qc => new CategoryDTO { Id = qc.Category.Id, Name = qc.Category.Name }).ToList()
            ))
            .ForMember(dest => dest.Tags, opt => opt.MapFrom(src =>
                src.QuestionTags.Select(qt => new TagDTO { Slug = qt.Tag.Slug }).ToList()
            ));
            CreateMap<Tag, TagDTO>()
                .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => src.Slug));

            CreateMap<SubscriptionPlan, SubscriptionPlanDTO>();

            // Mapping cho SessionAnswer -> SessionAnswerResultDto
            CreateMap<SessionAnswer, SessionAnswerResultDto>()
                .ForMember(dest => dest.Feedback, opt =>    
                    opt.MapFrom(src => !string.IsNullOrEmpty(src.Feedback)
                        ? JsonSerializer.Deserialize<FeedbackDto>(src.Feedback, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                        : null
                    )); 

            // MAPPING MỚI: Từ MockSession sang SessionResultDto
            CreateMap<MockSession, SessionResultDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.SessionType, opt => opt.MapFrom(src => src.SessionType.ToString()))
                .ForMember(dest => dest.Answers, opt => opt.MapFrom(src => src.SessionAnswers));

            CreateMap<SubscriptionPlan, SubscriptionPlanDTO>().ReverseMap(); 
            CreateMap<UpdateSubscriptionPlanInfoDTO, SubscriptionPlan>();

            CreateMap<AuditLog, SAAuditLogDTO>()
            .ForMember(dest => dest.UserName, opt => opt.Ignore()) // Sẽ gán thủ công trong service
            .ForMember(dest => dest.UserRole, opt => opt.Ignore()) // Sẽ gán thủ công trong service
            .ForMember(dest => dest.Area, opt => opt.Ignore()) // Sẽ gán thủ công trong service
            .ForMember(dest => dest.ActionType, opt => opt.Ignore());
        }
    }
}
