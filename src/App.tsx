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

  const todosJSX = todos.data?.data.todos.map((todo) => (
    <div key={todo.id} className="todo-card">
      <h2>{todo.headline}</h2>
      <div>{todo.description}</div>
      <input type="checkbox" checked={todo.done} />
    </div>
  ));
  return todosJSX;
}

export default App;
