import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import pool, { initializeDatabase } from './db.js'

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const app = new Hono()

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// データベース初期化
initializeDatabase().catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/todos', async (c) => {
  try {
    const result = await pool.query('SELECT id, title, completed FROM todos ORDER BY id ASC');
    const todos: Todo[] = result.rows.map((row: { id: number; title: string; completed: boolean }) => ({
      id: row.id,
      title: row.title,
      completed: row.completed,
    }));
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

    const result = await pool.query(
      'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING id, title, completed',
      [title, false]
    );
    
    const todo: Todo = {
      id: result.rows[0].id,
      title: result.rows[0].title,
      completed: result.rows[0].completed,
    };
    
    return c.json({ todo }, 201);
  } catch (err) {
    console.error('Error creating todo:', err);
    return c.json({ error: 'Failed to create todo' }, 500);
  }
});

app.put('/todos/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    
    console.log('PUT /todos/:id - Request:', { id, body });
    
    // 既存のTodoを取得
    const existingResult = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      console.log('Todo not found:', id);
      return c.notFound();
    }
    
    const existingTodo = existingResult.rows[0];
    console.log('Before update:', { id: existingTodo.id, title: existingTodo.title, completed: existingTodo.completed });
    
    // 更新するフィールドを構築
    const updates: string[] = [];
    const values: (string | boolean | number)[] = [];
    let paramIndex = 1;
    
    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(body.title);
      paramIndex++;
    }
    
    if (body.completed !== undefined) {
      updates.push(`completed = $${paramIndex}`);
      values.push(body.completed);
      paramIndex++;
    }
    
    if (updates.length === 0) {
      return c.json({ todo: existingTodo }, 200);
    }
    
    // updated_atを更新
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(Number(id));
    
    const query = `UPDATE todos SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, title, completed`;
    
    const result = await pool.query(query, values);
    const todo: Todo = {
      id: result.rows[0].id,
      title: result.rows[0].title,
      completed: result.rows[0].completed,
    };
    
    console.log('After update:', { id: todo.id, title: todo.title, completed: todo.completed });
    
    return c.json({ todo }, 200);
  } catch (err) {
    console.error('Error updating todo:', err);
    return c.json({ error: 'Failed to update todo' }, 500);
  }
});

serve({
  fetch: app.fetch,
  port: 3000
}, async (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
