import "./App.css";
import { honoClient } from "./clients/hono";
import { useHono } from "./hooks/useHono";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

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
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over.id) {
			const { id1, id2, position1, position2 } = {
				id1: active.id as number,
				id2: over!.id as number,
				position1: active!.data!.current!.position as number,
				position2: over!.data!.current!.position as number,
			};
			console.log("fromId", id1);
			console.log("toId", id2);

			const todo1Idx = todos.findIndex(todo => todo.id === id1);
			const todo2Idx = todos.findIndex(todo => todo.id === id2);

			mutate(
				async () => {
					const response = await honoClient.api.todos["@arrayMove"].$patch({
						json: { toId: id2, fromId: id1 },
					});
					const allTodosResponse = await honoClient.api.todos.$get({});
					if (!response.ok || !allTodosResponse.ok)
						throw new Error("Failed to swap todo positions");
					return await allTodosResponse.json();
				},
				{
					optimisticData: arrayMove(todos, todo1Idx, todo2Idx),
					rollbackOnError(error) {
						alert("Failed to swap todo positions");
						return true;
					},
					revalidate: false,
				}
			);
		}
	};

	return (
		<div className="App">
			<h1>Todo List</h1>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={todos.map(todo => todo.id)}
					strategy={verticalListSortingStrategy}
				>
					{todos.map(todo => (
						<SortableTodo key={todo.id} todo={todo} toggleDone={toggleDone} />
					))}
				</SortableContext>
			</DndContext>
		</div>
	);
}

export default App;
function SortableTodo({
	todo,
	toggleDone,
}: {
	todo: {
		id: number;
		created_at: string;
		description: string;
		done: boolean;
		headline: string;
		position: number;
	};
	toggleDone: (todo: Todo) => Promise<void>;
}) {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: todo.id,
		data: {
			position: todo.position,
		},
	});
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div className="todo-card" ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<h3>
				<input type="checkbox" checked={todo.done} onChange={() => toggleDone(todo)} />
				{todo.headline}
			</h3>
			<div>
				pos:{todo.position} id:{todo.id}
			</div>
		</div>
	);
}

// [0,1,2,3]
// idx 3: 3
// [3,0,1,2]
// idx 3: 0
