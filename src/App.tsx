import './App.css';
import { useState } from 'react';

function App() {
  const [title, setTitle] = useState("");
  const [todos, setTodos] = useState([
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
  ]);

  const handleAddTodo = () => {
    setTodos([
      ...todos,
      {
        id: todos.length + 1,
        title: title,
        completed: false,
      },
    ]);
    setTitle("");
  };

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
        className='border-2 border-gray-300 rounded-md p-2'
        />
        <button 
        type="submit" 
        className='bg-blue-500 text-white rounded-md p-2'
        onClick={handleAddTodo}
        >Add</button>
        <div>{title}</div>
      </div>
    </>
  );
}

export default App;
