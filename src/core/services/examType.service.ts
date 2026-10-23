// src/core/services/examType.service.ts
import { db } from '@/core/database/db';
import type { ExamType } from '@/core/database/types';

export const examTypeService = {
  // Hàm này sẽ tự động chạy để tạo dữ liệu mẫu nếu CSDL chưa có loại đề nào
  async initializeDefaults(): Promise<void> {
    const count = await db.examTypes.count();
    if (count === 0) {
      await db.examTypes.bulkAdd([
        { id: 'et-1', name: 'Đề thi Giữa kỳ', displayOrder: 1, isDefault: true },
        { id: 'et-2', name: 'Đề thi Cuối kỳ', displayOrder: 2, isDefault: false },
        { id: 'et-3', name: 'Đề Ôn tập Tự do', displayOrder: 3, isDefault: false },
      ]);
    }
  },

  async getAll(): Promise<ExamType[]> {
    return await db.examTypes.orderBy('displayOrder').toArray();
  }
};