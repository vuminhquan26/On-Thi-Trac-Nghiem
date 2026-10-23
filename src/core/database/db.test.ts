// src/core/database/db.test.ts
import 'fake-indexeddb/auto'; // Bắt buộc: Giả lập môi trường IndexedDB cho Node.js
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';
import type { Subject } from './types';

describe('QuizDatabase', () => {
  // Dọn dẹp Database trước mỗi test case để bảo đảm tính độc lập
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('khởi tạo thành công và có thể thêm/đọc dữ liệu (Bảng subjects)', async () => {
    // 1. Dữ liệu giả lập
    const mockSubject: Subject = {
      id: 'sub-1',
      name: 'Kiến trúc máy tính',
      description: 'Môn cơ sở ngành CNTT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Thêm dữ liệu vào bảng subjects
    await db.subjects.add(mockSubject);

    // 3. Truy vấn lại từ DB bằng khóa chính (id)
    const retrievedSubject = await db.subjects.get('sub-1');

    // 4. Xác minh kết quả
    expect(retrievedSubject).toBeDefined();
    expect(retrievedSubject?.name).toBe('Kiến trúc máy tính');
    expect(retrievedSubject?.description).toBe('Môn cơ sở ngành CNTT');
  });
});