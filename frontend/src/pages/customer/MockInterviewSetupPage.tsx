import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Services, Types, và UI Components
import { getPublicCategories, Category } from '../../services/categoryService';
import { startFullMockInterview } from '../../services/practiceService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Loader2 } from 'lucide-react';
import { CategoryForCustomer } from '@/types';

const MockInterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();

  // State để lưu danh sách categories lấy từ API
  const [allCategories, setAllCategories] = useState<CategoryForCustomer[]>([]);
  
  // State để quản lý lựa chọn của người dùng
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  // Khởi tạo rỗng cho độ khó, giống với category
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]); 
  const [numQuestions, setNumQuestions] = useState<number>(5);

  // State cho việc tải dữ liệu và gửi request
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  // Lấy danh sách categories khi component được tải
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getPublicCategories();
        setAllCategories(data);
      } catch (error) {
        toast.error("Không thể tải danh sách danh mục.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Hàm xử lý khi check/uncheck category
  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Hàm xử lý khi check/uncheck difficulty (không thay đổi logic này)
  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  // Hàm xử lý khi nhấn nút bắt đầu
  const handleStartInterview = async () => {
    // Không cần kiểm tra selectedDifficulties.length === 0 ở đây để hiển thị toast nữa.
    // Logic mặc định 3 độ khó sẽ nằm trong requestBody.

    setIsStarting(true);
    try {
      const requestBody = {
        categoryIds: selectedCategoryIds, // Nếu rỗng, backend hiểu là tất cả
        // Logic mới: Nếu người dùng không chọn độ khó nào (mảng rỗng), thì gửi cả 3 độ khó Easy, Medium, Hard.
        // Ngược lại, gửi các độ khó đã chọn.
        difficultyLevels: selectedDifficulties.length === 0 
                          ? ['Easy', 'Medium', 'Hard'] 
                          : selectedDifficulties,
        numberOfQuestions: numQuestions,
      };

      const session = await startFullMockInterview(requestBody);
      toast.success("Đã tạo phiên phỏng vấn thành công!");

      // Điều hướng đến trang làm bài
      navigate(`/interview/session/${session.id}`, { 
        state: { sessionData: session } 
      });

    } catch (error) {
      toast.error("Không thể bắt đầu phiên. Vui lòng thử lại.");
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Tùy chỉnh Bài Phỏng vấn</h1>
        <p className="mt-2 text-gray-600">Lựa chọn các thông số để bắt đầu phiên luyện tập của bạn.</p>
      </div>
      
      {/* Select Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Lựa chọn Danh mục</CardTitle>
          <CardDescription>Chọn các chủ đề bạn muốn luyện tập (để trống nếu muốn chọn từ tất cả).</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCategories ? (
            <p>Đang tải danh mục...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allCategories.map(category => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category.id}`}
                    checked={selectedCategoryIds.includes(category.id)}
                    onCheckedChange={() => handleCategoryChange(category.id)}
                  />
                  <label htmlFor={`cat-${category.id}`} className="text-sm font-medium leading-none cursor-pointer">
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Difficulty Level */}
      <Card>
        <CardHeader>
          <CardTitle>Mức độ khó</CardTitle>
          <CardDescription>Chọn một hoặc nhiều mức độ khó cho các câu hỏi (để trống nếu muốn chọn từ tất cả).</CardDescription> {/* Cập nhật mô tả */}
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Easy', 'Medium', 'Hard'].map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                          id={`diff-${level}`}
                          checked={selectedDifficulties.includes(level)}
                          onCheckedChange={() => handleDifficultyChange(level)}
                      />
                      <label htmlFor={`diff-${level}`} className="text-sm font-medium leading-none cursor-pointer">
                          {level}
                      </label>
                    </div>
            ))}
        </CardContent>
      </Card>
      
      {/* Number of Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Số lượng câu hỏi</CardTitle>
          <CardDescription>Chọn số lượng câu hỏi bạn muốn có trong phiên (2-7).</CardDescription> 
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>{numQuestions} câu hỏi</span>
          </div>
          <Slider
            defaultValue={[5]}
            value={[numQuestions]}
            max={7}
            min={2} 
            step={1}
            onValueChange={(value) => setNumQuestions(value[0])}
          />
        </CardContent>
      </Card>

      <div className="text-center">
        <Button size="lg" onClick={handleStartInterview} disabled={isStarting}>
          {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isStarting ? "Đang chuẩn bị..." : "Bắt đầu Phỏng vấn"}
        </Button>
      </div>
    </div>
  );
};

export default MockInterviewSetupPage;