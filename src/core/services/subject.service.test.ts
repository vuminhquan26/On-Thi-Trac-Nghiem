// src/core/services/subject.service.test.ts
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/core/database/db';
import { subjectService } from './subject.service';

describe('Subject Service CRUD', () => {
  beforeEach(async () => {
    // Làm sạch CSDL trước mỗi test case
    await db.delete();
    await db.open();
  });

  it('Thực thi trọn vẹn luồng Create, Read, Update, Delete', async () => {
    // 1. CREATE
    const subject = await subjectService.create('Lập trình Vue 3', 'Học phần Frontend');
    expect(subject.id).toBeDefined();
    expect(subject.name).toBe('Lập trình Vue 3');

    // 2. READ ALL
    const allSubjects = await subjectService.getAll();
    expect(allSubjects.length).toBe(1);
    expect(allSubjects[0].id).toBe(subject.id);

    // 3. UPDATE
    await subjectService.update(subject.id, { name: 'Vue 3 Nâng cao' });
    const updatedSubject = await subjectService.getById(subject.id);
    expect(updatedSubject?.name).toBe('Vue 3 Nâng cao');
    // Kiểm tra updatedAt có thay đổi so với createdAt không
    expect(updatedSubject?.updatedAt).not.toBe(updatedSubject?.createdAt);

    // 4. DELETE
    await subjectService.delete(subject.id);
    const finalSubjects = await subjectService.getAll();
    expect(finalSubjects.length).toBe(0);
  });
});