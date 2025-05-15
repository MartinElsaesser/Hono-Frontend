import "./App.css";
import { honoClient } from "./clients/hono";
import { useHono } from "./hooks/useHono";

const getAllTodos = honoClient.api.todos.$get;

function App() {
  const {data: todos, isLoading, error, mutate} = useHono({
    input: {},
    endpoint: getAllTodos,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  const todoList = todos?.data.todos.map((todo) => (
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
