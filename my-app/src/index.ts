import { serve } from '@hono/node-server'
import { Hono } from 'hono'

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const todos: Todo[] = [];

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/todos', (c) => {
  return c.json({ todos }, 200);
});

app.post('/todos', async (c) => {
  const { title } = await c.req.json();
  const todo: Todo = {
    id: todos.length + 1,
    title,
    completed: false,
  };
  todos.push(todo);
  return c.json({ todo }, 201);
});


serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
