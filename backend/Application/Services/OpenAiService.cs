using System.Text.Json;
using InterviewPrep.API.Application.DTOs.MockSessions;
using InterviewPrep.API.Application.Services;
using OpenAI;
using OpenAI.Chat;

public class OpenAiService : IAiService
{
    private readonly OpenAIClient _openAiClient;
    private readonly ILogger<OpenAiService> _logger;
    private readonly string _model;

    public OpenAiService(IConfiguration configuration, ILogger<OpenAiService> logger)
    {
        var apiKey = configuration["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI API key is not configured");

        _model = configuration["OpenAI:Model"] ?? "gpt-4o-mini";
        _openAiClient = new OpenAIClient(apiKey);
        _logger = logger;
    }

    public async Task<(FeedbackDto Feedback, int Score)> GetFeedbackForAnswerAsync(string question, string userAnswer)
    {
        try
        {
            _logger.LogInformation("Analyzing answer for question: {Question}", question);

            var systemPrompt = @"Bạn là một người phỏng vấn kỹ thuật cấp cao (Senior/Staff Engineer) và là một chuyên gia đánh giá câu trả lời trong lĩnh vực lập trình, kiến trúc hệ thống, và công nghệ phần mềm.
                     Mục tiêu của bạn là đánh giá câu trả lời như trong một buổi phỏng vấn kỹ thuật thực tế, đòi hỏi sự sâu sắc, tính khả mở, hiệu suất, và các cân nhắc về thiết kế hệ thống.

                     Hãy đưa ra phản hồi trực tiếp, thân thiện nhưng **rất thẳng thắn và chuyên nghiệp**, tập trung vào các điểm mạnh và điểm cần cải thiện của câu trả lời.
                     Trong phần đánh giá tổng quan, điểm mạnh và các điểm cần cải thiện, hãy xưng hô 'bạn' và tập trung vào câu trả lời của 'bạn'.

                     **TIÊU CHÍ ĐÁNH GIÁ ĐIỂM SỐ (0-100):**
                     - **0-30 điểm (Kém/Không thể chấp nhận):** Câu trả lời hoàn toàn sai, không liên quan, cợt nhả, từ chối trả lời, hoặc thể hiện sự thiếu hiểu biết nghiêm trọng.
                     - **31-50 điểm (Cơ bản/Yếu):** Bạn chỉ nắm được các khái niệm cơ bản nhất, thiếu chi tiết kỹ thuật, không đề cập đến các vấn đề scale, hiệu suất, hoặc các cân nhắc quan trọng khác.
                     - **51-70 điểm (Khá/Trung bình):** Bạn đã nắm được các yếu tố cốt lõi nhưng còn thiếu chiều sâu, chưa giải quyết được các vấn đề phức tạp, hoặc bỏ qua một số khía cạnh quan trọng của thiết kế hệ thống.
                     - **71-85 điểm (Tốt/Khá giỏi):** Bạn đã giải thích rõ ràng, có chiều sâu, đề cập đến nhiều khía cạnh quan trọng và các cân nhắc thiết kế. Có thể còn thiếu một vài chi tiết nhỏ hoặc tối ưu hóa.
                     - **86-100 điểm (Xuất sắc/Tuyệt vời):** Bạn đã trình bày một giải pháp toàn diện, sâu sắc, có tính khả mở cao, hiệu quả, và xem xét tất cả các khía cạnh quan trọng. Câu trả lời thể hiện sự am hiểu sâu rộng và kinh nghiệm thực tế.

                     **QUY TẮC ĐẶC BIỆT (Zero Score Handling):**
                     Nếu câu trả lời của người được phỏng vấn **hoàn toàn không liên quan đến câu hỏi, cợt nhả, thiếu nghiêm túc, hoặc thể hiện sự từ chối trả lời (ví dụ: 'tôi không biết', 'tôi đéo biết', 'không có gì để nói', 'bạn tự tìm hiểu đi')**, bạn phải:
                     - Đặt ""score"" là **0**.
                     - Trong ""overall"", hãy đưa ra một phản hồi **thẳng thắn và nghiêm túc**, chỉ rõ rằng câu trả lời không đáp ứng yêu cầu và thể hiện sự thiếu chuyên nghiệp.
                     - Để trống ""strengths"" (mảng rỗng).
                     - Trong ""improvements"", hãy nêu rõ rằng cần có sự chuẩn bị tốt hơn, thái độ nghiêm túc hơn, hoặc cần thực sự cố gắng trả lời câu hỏi.

                     Bạn phải phản hồi CHỈ với một đối tượng JSON hợp lệ. Đối tượng JSON phải có hai khóa cấp cao nhất: ""score"" (một số nguyên từ 0 đến 100) và ""feedback"".
                     Đối tượng ""feedback"" phải chứa ba khóa: ""overall"" (một chuỗi tóm tắt), ""strengths"" (một mảng các chuỗi), và ""improvements"" (một mảng các chuỗi).

                     Điểm số từ 0-100. Overall là đánh giá tổng quan, strengths là những điểm tốt, improvements là những điểm cần cải thiện. Chỉ trả về JSON, không thêm text khác.";

            var userPrompt = $@"Câu hỏi: {question}

                     Câu trả lời của bạn: {userAnswer}

                     Hãy đánh giá câu trả lời của tôi và cho tôi phản hồi chi tiết.";

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(userPrompt)
            };

            var chatCompletionOptions = new ChatCompletionOptions
            {
                Temperature = 0.3f,
                MaxOutputTokenCount = 1500,
                ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
            };

            var chatClient = _openAiClient.GetChatClient(_model);
            var response = await chatClient.CompleteChatAsync(messages, chatCompletionOptions);

            if (response?.Value?.Content == null || response.Value.Content.Count == 0)
            {
                throw new InvalidOperationException("No response received from OpenAI");
            }

            var responseContent = response.Value.Content[0].Text.Trim();
            _logger.LogDebug("OpenAI response: {Response}", responseContent);

            var result = ParseOpenAiResponse(responseContent);

            _logger.LogInformation("Successfully analyzed answer. Score: {Score}", result.Score);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting feedback for answer");

            var fallbackFeedback = new FeedbackDto
            {
                Overall = "Có lỗi xảy ra khi phân tích câu trả lời. Vui lòng thử lại.",
                Strengths = new List<string> { "Không thể phân tích được do lỗi hệ thống" },
                Improvements = new List<string> { "Vui lòng thử lại sau" }
            };

            return (fallbackFeedback, 0);
        }
    }

    private (FeedbackDto Feedback, int Score) ParseOpenAiResponse(string responseContent)
    {
        try
        {
            var cleanedResponse = responseContent
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            var jsonResponse = JsonSerializer.Deserialize<OpenAiResponse>(cleanedResponse, options);

            if (jsonResponse?.Feedback == null)
            {
                throw new InvalidOperationException("Invalid response format from OpenAI");
            }

            return (jsonResponse.Feedback, jsonResponse.Score);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse OpenAI JSON response: {Response}", responseContent);
            var basicFeedback = new FeedbackDto
            {
                Overall = responseContent.Length > 200 ? responseContent[..200] + "..." : responseContent,
                Strengths = new List<string> { "Phản hồi không đúng định dạng JSON mong đợi" },
                Improvements = new List<string> { "Cần xem xét lại format phản hồi" }
            };

            var score = ExtractScoreFromText(responseContent);

            return (basicFeedback, score);
        }
    }

    private int ExtractScoreFromText(string text)
    {
        var scoreMatch = System.Text.RegularExpressions.Regex.Match(text, @"\b([0-9]{1,2}|100)\b");

        if (scoreMatch.Success && int.TryParse(scoreMatch.Value, out int score) && score <= 100)
        {
            return score;
        }

        return 50; 
    }

    private class OpenAiResponse
    {
        public FeedbackDto Feedback { get; set; } = new();
        public int Score { get; set; }
    }
}