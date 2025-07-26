import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Cập nhật Props để nhận thêm thông tin
interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({ 
  currentPage, 
  totalPages,
  totalItems,
  itemsPerPage, 
  onPageChange 
}) => {
  // Không hiển thị gì nếu chỉ có 1 trang hoặc không có trang nào
  if (totalPages <= 1) {
    return null;
  }

  // Tính toán chỉ số của các mục đang hiển thị
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Logic để tạo ra các nút số trang một cách thông minh (ví dụ: 1 ... 4 5 6 ... 10)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const pageNeighbours = 1; // Số lượng trang liền kề mỗi bên của trang hiện tại

    // Luôn thêm trang đầu tiên
    pageNumbers.push(1);

    // Thêm dấu '...' nếu cần
    if (currentPage > pageNeighbours + 2) {
      pageNumbers.push('...');
    }
    
    // Thêm các trang xung quanh trang hiện tại
    for (let i = Math.max(2, currentPage - pageNeighbours); i <= Math.min(totalPages - 1, currentPage + pageNeighbours); i++) {
      pageNumbers.push(i);
    }
    
    // Thêm dấu '...' nếu cần
    if (currentPage < totalPages - pageNeighbours - 1) {
      pageNumbers.push('...');
    }
    
    // Luôn thêm trang cuối cùng (nếu nó chưa có)
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    // Loại bỏ các giá trị trùng lặp (xảy ra khi có ít trang)
    return [...new Set(pageNumbers)];
  };

  const pageNumbersToDisplay = getPageNumbers();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Phần hiển thị thông tin */}
        <div className="text-sm text-gray-600">
          Hiển thị <span className="font-medium">{startItem}</span> đến <span className="font-medium">{endItem}</span> trên tổng số <span className="font-medium">{totalItems}</span> câu hỏi
        </div>
        
        {/* Phần các nút điều khiển */}
        <div className="flex items-center space-x-2">
          {/* Nút Previous */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trước</span>
          </button>
          
          {/* Các nút số trang */}
          <div className="flex items-center space-x-1">
            {pageNumbersToDisplay.map((page, index) =>
              typeof page === 'number' ? (
                <button
                  key={index}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span key={index} className="px-3 py-2 text-sm text-gray-500">...</span>
              )
            )}
          </div>
          
          {/* Nút Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>Sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;