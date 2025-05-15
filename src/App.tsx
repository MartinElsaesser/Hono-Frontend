import "./App.css";
import { honoClient } from "./clients/hono";
import { useHono } from "./hooks/useHono";

const getAllTodos = honoClient.api.todos.$get;
type Todo = {
	id: number;
	created_at: string;
	description: string;
	done: boolean;
	headline: string;
	position: number;
};

function App() {
	const { data: todos, mutate } = useHono({
		input: {},
		endpoint: getAllTodos,
	});

	const toggleDone = async (todo: Todo) => {
		const optimisticData = todos.map(t => ({
			...t,
			done: t.id == todo.id ? !t.done : t.done,
		}));
		mutate(
			async () => {
				const response = await honoClient.api.todos[":todoId"].$patch({
					param: { todoId: todo.id.toString() },
					json: {
						done: !todo.done,
					},
				});
				const allTodosResponse = await honoClient.api.todos.$get({});
				if (!response.ok || !allTodosResponse.ok) throw new Error("Failed to update todo");
				return await allTodosResponse.json();
			},
			{
				optimisticData,
				rollbackOnError(error) {
					alert("Failed to update todo");
					return true;
				},
				revalidate: false,
			}
		);
	};

	const todoList = todos.map(todo => (
		<div key={todo.id} className="todo-card">
			<h3>
				<input type="checkbox" checked={todo.done} onChange={() => toggleDone(todo)} />
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
