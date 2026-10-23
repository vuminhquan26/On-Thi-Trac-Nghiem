// src/core/services/question.service.test.ts
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/core/database/db';
import { subjectService } from './subject.service';
import { examTypeService } from './examType.service';
import { questionSetService } from './questionSet.service';
import { questionService } from './question.service';

describe('Question Service', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('Tạo câu hỏi mới và đếm số lượng trong bộ đề', async () => {
    // 1. Chuẩn bị dữ liệu cha
    const subject = await subjectService.create('Lịch sử', 'Môn Lịch sử');
    await examTypeService.initializeDefaults();
    const examTypes = await examTypeService.getAll();
    const qSet = await questionSetService.create(subject.id, examTypes[0].id, 'Đề số 1');

    // 2. Tạo 2 câu hỏi
    await questionService.create(qSet.id, subject.id, 'Câu hỏi 1?');
    await questionService.create(qSet.id, subject.id, 'Câu hỏi 2?');

    // 3. Truy vấn và kiểm tra thứ tự
    const questions = await questionService.getByQuestionSetId(qSet.id);
    
    expect(questions.length).toBe(2);
    expect(questions[0].content).toBe('Câu hỏi 1?');
    expect(questions[0].defaultOrder).toBe(1);
    expect(questions[1].defaultOrder).toBe(2);
  });
});