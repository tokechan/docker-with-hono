import './App.css';
import { useState } from 'react';

function App() {
  const [title, setTitle] = useState("");
  const todos = [
    {
      id: 1,
      title: "todo 1",
      completed: false,
    },
    {
      id: 2,
      title: "todo 2",
      completed: true,
    },
    {
      id: 3,
      title: "todo 3",
      completed: false,
    },
  ];

  console.log(todos);

  return (
    <>
        <div>
        <h1>Todo List</h1>
        {todos.map((todo) => (
          <div key={todo.id}>{todo.title}</div>
        ))}
        <input 
        type="text"
        placeholder="Add a new todo"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Add</button>
        <div>{title}</div>
      </div>
    </>
  );
}

export default App;
