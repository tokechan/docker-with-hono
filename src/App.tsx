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

  const handleToggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  

  return (    
    <div className="min-h-screen bg-gradient-to-br rounded-lg  to-indigo-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className='text-3xl font-bold text center text-gray-800 mb-6'>
            Todo Lis App
          </h1>
          
          <div className='flex gap-2 mb-6'>
            <input 
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new task..."
              aria-label="Add a new task"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
                onClick={handleAddTodo}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                Add Task
            </button>
          </div>

            {todos.length === 0 ? (
              <div className='text-center text-gray-500 py-8'>
                <p className='text-lg'>No tasks yet.</p>
                <p className='text-sm'>Add a new task to get started.</p>
              </div>
            ) : (
              <ul className='space-y-3'>
                {todos.map((todo) => (
                  <li 
                    key={todo.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 ${
                      todo.completed
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type='checkbox'
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo.id)}
                      className='w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                    />
                    <span 
                    className={`flex-1 ${
                      todo.completed
                        ? 'line-through text-gray-500' 
                        : 'text-gray-800'} text-sm font-medium
                      }`}
                    >
                      {todo.title}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {todos.length > 0 && (
            <div className='mt-6 text-center text-sm text-gray-500'>
                <p className='text-sm text-gray-500 text-center'>
                  Done: {todos.filter((todo) => todo.completed).length} /{''} 
                  {todos.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
}
export default App;
