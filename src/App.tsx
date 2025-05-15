import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { honoClient } from "./clients/hono";
import { useHono } from "./hooks/useHono";

const getTodoById = honoClient.api.todos[":id"].$get;
function TodoDisplay() {
  const todos = useHono({
    input: {
      param: {
        id: "1",
      },
    },
    endpoint: getTodoById,
  });
  if (todos.isLoading) return <div>Loading...</div>;
  if (todos.error) return <div>Error</div>;

  const todoJSX = todos.data?.data.post;
  return <div>{todoJSX?.headline}</div>;
  // const todosJSX = todos.data?.data.posts.map((post) => (
  //   <div>{post.headline}</div>
  // ));
  // return todosJSX;
}

function App() {
  return (
    <>
      <TodoDisplay />
      <TodoDisplay />
      <TodoDisplay />
      <TodoDisplay />
      <TodoDisplay />
      <TodoDisplay />
      <TodoDisplay />
      <TodoDisplay />
      <TodoDisplay />
      <TodoDisplay />
    </>
  );
}

export default App;
