// src/core/services/questionSet.service.test.ts
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/core/database/db';
import { subjectService } from './subject.service';
import { examTypeService } from './examType.service';
import { questionSetService } from './questionSet.service';

describe('QuestionSet Service', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('Tạo bộ đề thành công dựa trên Môn học và Loại đề', async () => {
    // 1. Chuẩn bị dữ liệu cha (Subject & ExamType)
    const subject = await subjectService.create('Toán Rời Rạc', 'Môn học cơ sở');
    await examTypeService.initializeDefaults();
    const examTypes = await examTypeService.getAll();
    const defaultExamType = examTypes[0];

    // 2. Tạo QuestionSet
    const questionSet = await questionSetService.create(
      subject.id,
      defaultExamType.id,
      'Đề thi thử số 1',
      'Đề có 50 câu'
    );

    // 3. Xác minh tính đúng đắn
    expect(questionSet.id).toBeDefined();
    expect(questionSet.subjectId).toBe(subject.id);
    expect(questionSet.examTypeId).toBe(defaultExamType.id);

    // 4. Kiểm tra hàm lấy danh sách theo subjectId
    const sets = await questionSetService.getBySubjectId(subject.id);
    expect(sets.length).toBe(1);
    expect(sets[0].name).toBe('Đề thi thử số 1');
  });
});