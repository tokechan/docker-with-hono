import './App.css';
import { useEffect, useState } from 'react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [title, setTitle] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/todos`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTodos(data.todos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch todos';
      setError(errorMessage);
      console.error('Failed to fetch todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!title.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add todo: ${response.statusText}`);
      }

      const data = await response.json();
      setTodos([...todos, data.todo]);
      setTitle("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add todo';
      setError(errorMessage);
      console.error('Failed to add todo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    // Optimistic Update: 即座にUIを更新
    const previousTodos = todos;
    const newCompleted = !todo.completed;
    const updatedTodos = todos.map((t) => 
      t.id === id ? { ...t, completed: newCompleted } : t
    );
    setTodos(updatedTodos);

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: newCompleted }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update todo: ${response.statusText}`);
      }

      const data = await response.json();
      // サーバーからのレスポンスで状態を更新
      setTodos((currentTodos) =>
        currentTodos.map((t) => (t.id === id ? data.todo : t))
      );
    } catch (err) {
      // エラー時は元の状態に戻す
      setTodos(previousTodos);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update todo';
      setError(errorMessage);
      console.error('Failed to update todo:', err);
    }
  };

  const handleStartEdit = (id: number, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingTitle.trim()) {
      setError("Todoのタイトルを入力してください");
      return;
    }

    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const newTitle = editingTitle.trim();
    
    // Optimistic Update: 即座にUIを更新
    const previousTodos = todos;
    const updatedTodos = todos.map((t) => 
      t.id === id ? { ...t, title: newTitle } : t
    );
    setTodos(updatedTodos);
    setEditingId(null);
    setEditingTitle("");

    try {
      setError(null);
      console.log('Updating todo:', { id, title: newTitle });
      const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update todo: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Todo updated successfully:', data);
      // サーバーからのレスポンスで状態を更新（サーバーの値が正しいことを確認）
      if (data.todo && data.todo.title === newTitle) {
        setTodos((currentTodos) =>
          currentTodos.map((t) => (t.id === id ? data.todo : t))
        );
      } else {
        // サーバーからのレスポンスが期待と異なる場合は、Optimistic Updateの内容を保持
        console.warn('Server response does not match expected title. Keeping optimistic update.');
      }
    } catch (err) {
      // エラー時は元の状態に戻す
      setTodos(previousTodos);
      setEditingId(id);
      setEditingTitle(todo.title);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update todo';
      setError(errorMessage);
      console.error('Failed to update todo:', err);
    }
  };

  

  return (    
    <div className="min-h-screen bg-gradient-to-br rounded-lg  to-indigo-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className='text-3xl font-bold text center text-gray-800 mb-6'>
            Todo List App
          </h1>

          {error && (
            <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
              <p className='text-sm'>{error}</p>
            </div>
          )}
          
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
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Adding...' : 'Add Task'}
            </button>
          </div>

            {loading && todos.length === 0 ? (
              <div className='text-center text-gray-500 py-8'>
                <p className='text-lg'>Loading...</p>
              </div>
            ) : todos.length === 0 ? (
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
                      disabled={editingId === todo.id}
                      className='w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50'
                    />
                    {editingId === todo.id ? (
                      <div className='flex-1 flex items-center gap-2'>
                        <input
                          type='text'
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit(todo.id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                          className='flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                        />
                        <button
                          onClick={() => handleSaveEdit(todo.id)}
                          className='px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm'
                        >
                          保存
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className='px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm'
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <>
                        <span 
                          className={`flex-1 ${
                            todo.completed
                              ? 'line-through text-gray-500' 
                              : 'text-gray-800'} text-sm font-medium
                            }`}
                        >
                          {todo.title}
                        </span>
                        <button
                          onClick={() => handleStartEdit(todo.id, todo.title)}
                          disabled={todo.completed}
                          className='px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          編集
                        </button>
                      </>
                    )}
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
