import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { dbAll, dbGet, dbRun } from '../db';
import { createTaskSchema, updateTaskSchema } from '../schemas/task';

const router = Router();

// Helper to map DB row (completed as 0/1) to API representation (completed as boolean)
const mapTaskRow = (row: any) => {
  if (!row) return row;
  return {
    ...row,
    completed: !!row.completed
  };
};

// 1. Get task statistics
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await dbAll<any>('SELECT * FROM tasks');
    const total = tasks.length;
    let completedCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    for (const t of tasks) {
      if (t.completed === 1) {
        completedCount++;
      } else {
        pendingCount++;
      }

      if (t.completed !== 1 && t.due_date && t.due_date < todayStr) {
        overdueCount++;
      }
    }

    const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    res.json({
      total,
      completed: completedCount,
      pending: pendingCount,
      completionRate,
      overdue: overdueCount
    });
  } catch (err) {
    next(err);
  }
});

// 2. Get all tasks with q (search) and status query filters, sorted by created_at DESC
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, q } = req.query;

    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params: any[] = [];

    // status query parameter: could be 'completed' / 'pending' / '1' / '0' / 'true' / 'false'
    if (status !== undefined && status !== '') {
      const isCompleted = (status === 'completed' || status === '1' || status === 'true');
      query += ' AND completed = ?';
      params.push(isCompleted ? 1 : 0);
    }

    // q query parameter: search across title and description
    if (q) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    // sorted by created_at DESC
    query += ' ORDER BY created_at DESC';

    const tasks = await dbAll<any>(query, params);
    res.json(tasks.map(mapTaskRow));
  } catch (err) {
    next(err);
  }
});

// 3. Get single task by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const task = await dbGet<any>('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task) {
      const error: any = new Error('Task not found');
      error.status = 404;
      error.error = 'Not Found';
      return next(error);
    }

    res.json(mapTaskRow(task));
  } catch (err) {
    next(err);
  }
});

// 4. Create new task with Zod validation
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    const id = randomUUID();
    const now = new Date().toISOString();

    await dbRun(`
      INSERT INTO tasks (id, title, description, due_date, completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      validatedData.title,
      validatedData.description,
      validatedData.due_date,
      validatedData.completed ? 1 : 0,
      now,
      now
    ]);

    const newTask = await dbGet<any>('SELECT * FROM tasks WHERE id = ?', [id]);
    res.status(201).json(mapTaskRow(newTask));
  } catch (err) {
    next(err);
  }
});

// 5. Update task with PATCH and Zod validation
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const task = await dbGet<any>('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!task) {
      const error: any = new Error('Task not found');
      error.status = 404;
      error.error = 'Not Found';
      return next(error);
    }

    const validatedData = updateTaskSchema.parse(req.body);
    const now = new Date().toISOString();

    const updatedTitle = validatedData.title !== undefined ? validatedData.title : task.title;
    const updatedDescription = validatedData.description !== undefined ? validatedData.description : task.description;
    const updatedDueDate = validatedData.due_date !== undefined ? validatedData.due_date : task.due_date;
    const updatedCompleted = validatedData.completed !== undefined ? (validatedData.completed ? 1 : 0) : task.completed;

    await dbRun(`
      UPDATE tasks
      SET title = ?, description = ?, due_date = ?, completed = ?, updated_at = ?
      WHERE id = ?
    `, [
      updatedTitle,
      updatedDescription,
      updatedDueDate,
      updatedCompleted,
      now,
      id
    ]);

    const updatedTask = await dbGet<any>('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(mapTaskRow(updatedTask));
  } catch (err) {
    next(err);
  }
});

// 6. Delete task
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await dbRun('DELETE FROM tasks WHERE id = ?', [id]);
    if (result.changes === 0) {
      const error: any = new Error('Task not found');
      error.status = 404;
      error.error = 'Not Found';
      return next(error);
    }

    res.json({ message: 'Task deleted successfully', id });
  } catch (err) {
    next(err);
  }
});

export default router;
