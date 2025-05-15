import "./App.css";
import { honoClient } from "./clients/hono";
import { useHono } from "./hooks/useHono";

const getAllTodos = honoClient.api.todos.$get;

function App() {
  const todos = useHono({
    input: {},
    endpoint: getAllTodos,
  });

  if (todos.isLoading) return <div>Loading...</div>;
  if (todos.error) return <div>Error</div>;

  const todoList = todos.data?.data.todos.map((todo) => (
    <div key={todo.id} className="todo-card">
      <h3>
        <input type="checkbox" checked={todo.done} />
        {todo.headline}
      </h3>
      <div>{todo.description}</div>
    </div>
  ));
  return (
    <div className="App">
      <h1>Todo List</h1>
      {todoList}
    </div>
  );
}

export default App;
