import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { initializeDatabase } from './db.js'
import prisma from './lib/prisma.js'

const app = new Hono()

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// データベース初期化（サーバー起動前に完了させる）
async function startServer() {
  try {
    // データベースが準備できるまで少し待つ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await initializeDatabase();
    console.log('Database initialized, starting server...');
    
    serve({
      fetch: app.fetch,
      port: 3000
    }, async (info) => {
      console.log(`Server is running on http://localhost:${info.port}`)
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

startServer();

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/todos', async (c) => {
  try {
    const todos = await prisma.todo.findMany({
      select: {
        id: true,
        title: true,
        completed: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
    return c.json({ todos }, 200);
  } catch (err) {
    console.error('Error fetching todos:', err);
    return c.json({ error: 'Failed to fetch todos' }, 500);
  }
});

app.post('/todos', async (c) => {
  try {
    const { title } = await c.req.json();
    if (!title || typeof title !== 'string') {
      return c.json({ error: 'Title is required' }, 400);
    }

    // const result = await pool.query(
    //   'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING id, title, completed',
    //   [title, false]
    // );
    const todo =  await prisma.todo.create({
      data: { title, completed: false },
      select: { id: true, title: true, completed: true },
    });

    // const todo: Todo = {
    //   id: result.rows[0].id,
    //   title: result.rows[0].title,
    //   completed: result.rows[0].completed,
    // };
    
    return c.json({ todo }, 201);
  } catch (err) {
    console.error('Error creating todo:', err);
    return c.json({ error: 'Failed to create todo' }, 500);
  }
});

app.put('/todos/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const todoId = Number(id);

    if (Number.isNaN(todoId)) {
      return c.json({ error: 'Invalid todo id' }, 400);
    }

    const body = await c.req.json<{ title?: unknown; completed?: unknown }>();

    const data: { title?: string; completed?: boolean } = {};

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || !body.title.trim()) {
        return c.json({ error: 'Title must be a non-empty string' }, 400);
      }
      data.title = body.title;
    }

    if (body.completed !== undefined) {
      if (typeof body.completed !== 'boolean') {
        return c.json({ error: 'Completed must be a boolean' }, 400);
      }
      data.completed = body.completed;
    }

    if (Object.keys(data).length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    const todo = await prisma.todo.update({
      where: { id: todoId },
      data,
      select: { id: true, title: true, completed: true },
    });

    return c.json({ todo }, 200);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2025'
    ) {
      return c.notFound();
    }
    console.error('Error updating todo:', error);
    return c.json({ error: 'Failed to update todo' }, 500);
  }
});
