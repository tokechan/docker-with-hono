import './App.css';

function App() {
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
        <input type="text" name="title" placeholder="Add a new todo" />
        <button type="submit">Add</button>
      </div>
    </>
  );
}

export default App;
