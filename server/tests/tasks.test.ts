import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { initDB } from '../src/db';

describe('Tasks API Integration Tests', () => {
  beforeAll(() => {
    // Initialize DB schema and seed data before running tests
    initDB();
  });

  describe('GET /health', () => {
    it('should return 200 OK and health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return a list of tasks', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('completed');
    });

    it('should filter tasks by completed status', async () => {
      const res = await request(app).get('/api/tasks?status=completed');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((t: any) => {
        expect(t.completed).toBe(true);
      });
    });

    it('should filter tasks by search term q', async () => {
      const res = await request(app).get('/api/tasks?q=validation');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((t: any) => {
        expect(
          t.title.toLowerCase().includes('validation') ||
          t.description.toLowerCase().includes('validation')
        ).toBe(true);
      });
    });
  });

  describe('GET /api/tasks/stats', () => {
    it('should return calculated statistics', async () => {
      const res = await request(app).get('/api/tasks/stats');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('completed');
      expect(res.body).toHaveProperty('pending');
      expect(res.body).toHaveProperty('completionRate');
    });
  });

  describe('POST, PATCH, and DELETE Flow', () => {
    let createdTaskId: string;

    it('should create a new task when body is valid', async () => {
      const newTaskData = {
        title: 'Integrate testing with Vitest',
        description: 'Verify backend task routes work properly with schema validations.',
        due_date: '2026-06-30',
        completed: false
      };

      const res = await request(app)
        .post('/api/tasks')
        .send(newTaskData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(typeof res.body.id).toBe('string'); // uuid
      expect(res.body.title).toBe(newTaskData.title);
      expect(res.body.completed).toBe(newTaskData.completed);
      
      createdTaskId = res.body.id;
    });

    it('should return 400 Bad Request when title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({
          description: 'No title provided'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation Error');
      expect(res.body.message).toContain('title');
    });

    it('should patch/update an existing task', async () => {
      const patchData = {
        title: 'Updated testing title',
        completed: true
      };

      const res = await request(app)
        .patch(`/api/tasks/${createdTaskId}`)
        .send(patchData);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe(patchData.title);
      expect(res.body.completed).toBe(patchData.completed);
    });

    it('should return 404 for patching a non-existent task', async () => {
      const res = await request(app)
        .patch('/api/tasks/non-existent-uuid')
        .send({ title: 'New title' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not Found');
    });

    it('should delete an existing task', async () => {
      const res = await request(app).delete(`/api/tasks/${createdTaskId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Task deleted successfully');
      expect(res.body.id).toBe(createdTaskId);
    });

    it('should return 404 for deleting a non-existent task', async () => {
      const res = await request(app).delete('/api/tasks/non-existent-uuid');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not Found');
    });
  });
});
