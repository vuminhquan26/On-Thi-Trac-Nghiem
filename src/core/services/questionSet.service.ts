// src/core/services/questionSet.service.ts
import { db } from '@/core/database/db';
import type { QuestionSet } from '@/core/database/types';

export const questionSetService = {
  // Tạo bộ đề mới bắt buộc phải gắn với Môn học và Loại đề
  async create(subjectId: string, examTypeId: string, name: string, description: string = ''): Promise<QuestionSet> {
    const newSet: QuestionSet = {
      id: crypto.randomUUID(),
      subjectId,
      examTypeId,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.questionSets.add(newSet);
    return newSet;
  },

  // Lấy danh sách bộ đề theo Môn học (Rất cần thiết để hiển thị trên UI sau này)
  async getBySubjectId(subjectId: string): Promise<QuestionSet[]> {
    return await db.questionSets
      .where('subjectId')
      .equals(subjectId)
      .reverse() // Mới nhất lên đầu
      .sortBy('createdAt');
  },

  // Lấy chi tiết một bộ đề
  async getById(id: string): Promise<QuestionSet | undefined> {
    return await db.questionSets.get(id);
  },
  // Thêm hàm delete vào service
  async delete(setId: string): Promise<void> {
    // 1. Tìm và xóa tất cả câu hỏi thuộc bộ đề này
    const questions = await db.questions.where('questionSetId').equals(setId).toArray();
    const questionIds = questions.map(q => q.id);
    if (questionIds.length > 0) {
      await db.questions.bulkDelete(questionIds);
    }

    // 2. Tìm và xóa tất cả các phiên thi lịch sử của bộ đề này
    const sessions = await db.studySessions.where('questionSetId').equals(setId).toArray();
    const sessionIds = sessions.map(s => s.id);
    if (sessionIds.length > 0) {
      await db.studySessions.bulkDelete(sessionIds);
    }

    // 3. Cuối cùng, xóa chính bộ đề đó
    await db.questionSets.delete(setId);
  },
  // (Tính năng Update và Hard Delete phức tạp của Bộ đề sẽ được bổ sung sau)
};