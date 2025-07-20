import apiClient from './apiClient';

// Định nghĩa các kiểu dữ liệu cho DTOs
export interface SAAuditLogDTO {
    id: number;
    userId: string | null;
    userName: string | null;
    userRole: string | null;
    actionDescription: string;
    area: string; // Thêm vào DTO nhận từ backend
    actionType: string; // Thêm vào DTO nhận từ backend
    ipAddress: string | null;
    createdAt: string; // ISO string from backend
}

export interface AuditLogFilterParams {
    userId?: string;
    userName?: string;
    userRole?: string; // "Admin", "Staff", "No Role", "Customer"
    area?: string;     // "Category", "Question", "Subscription Plan", "User", "Unknown"
    actionType?: string; // "Added", "Updated", "Deleted", "Activated", "Inactivated", "Batch Activated", "Batch Inactivated", "Logged In/Out"
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
}

// Helper để phân tích action string (frontend-side)
// Hàm này sẽ được dùng để gán giá trị cho `area` và `actionType`
// nếu bạn không muốn backend trả về chúng trực tiếp
// NHƯNG TRONG BẢN CẬP NHẬT GẦN NHẤT, BACKEND ĐÃ TRẢ VỀ AREA VÀ ACTIONTYPE RỒI
// VÌ VẬY HÀM NÀY KHÔNG CẦN THIẾT NỮA TRONG SERVICE NÀY
// Tôi sẽ giữ nó làm ví dụ cho frontend nếu bạn thay đổi ý định backend
const parseAuditActionStringFrontend = (action: string) => {
    let area = "Unknown";
    let actionType = "Unknown";

    if (!action) return { area, actionType };

    if (action.startsWith("Added ")) actionType = "Added";
    else if (action.startsWith("Updated ")) actionType = "Updated";
    else if (action.startsWith("Deleted ")) actionType = "Deleted";
    else if (action.startsWith("Activated ")) actionType = "Activated";
    else if (action.startsWith("Inactivated ")) actionType = "Inactivated";
    else if (action.startsWith("Batch Inactivated ")) actionType = "Batch Inactivated";
    else if (action.startsWith("Batch Activated ")) actionType = "Batch Activated";
    else if (action.startsWith("Logged In")) actionType = "Logged In";
    else if (action.startsWith("Logged Out")) actionType = "Logged Out";
    else if (action.includes("Subscription Plan Info")) actionType = "Updated"; // Cụ thể hơn cho Subscription Plan Info

    if (action.includes("Category")) area = "Category";
    else if (action.includes("Question")) area = "Question";
    else if (action.includes("Subscription Plan")) area = "Subscription Plan";
    else if (action.includes("User ")) area = "User"; // Chú ý khoảng trắng để tránh nhầm lẫn

    return { area, actionType };
};


export const auditLogService = {
    getFilteredAuditLogs: async (filters: AuditLogFilterParams): Promise<SAAuditLogDTO[]> => {
        try {
            const params = new URLSearchParams();
            if (filters.userId) params.append('userId', filters.userId);
            if (filters.userName) params.append('userName', filters.userName);
            if (filters.userRole && filters.userRole !== 'all') params.append('userRole', filters.userRole);
            if (filters.area && filters.area !== 'all') params.append('area', filters.area); // Giờ backend xử lý
            if (filters.actionType && filters.actionType !== 'all') params.append('actionType', filters.actionType); // Giờ backend xử lý
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await apiClient.get<SAAuditLogDTO[]>(`/admin/audit-logs?${params.toString()}`);
            
            // Backend đã trả về area và actionType, chỉ cần định dạng lại createdAt
            return response.data.map(log => ({
                ...log,
                createdAt: new Date(log.createdAt).toLocaleString() // Định dạng cho UI
            }));

        } catch (error: any) {
            console.error('Error fetching audit logs:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch audit logs');
        }
    },
};