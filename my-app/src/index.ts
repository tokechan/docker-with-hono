import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'


interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const todos: Todo[] = [];

const app = new Hono()

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);



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

app.put('/todos/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const todo = todos.find((todo) => todo.id === Number(id));
  if (!todo) {
    return c.notFound();
  }
  
  // title または completed を更新可能にする
  if (body.title !== undefined) {
    todo.title = body.title;
  }
  if (body.completed !== undefined) {
    todo.completed = body.completed;
  }
  
  return c.json({ todo }, 200);
});


serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
