import { useCallback } from "react";
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
import { Switch } from "./components/Switch";

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

	const handleDoneChanged = useCallback(
		async (todo: Todo) => {
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
					if (!response.ok || !allTodosResponse.ok)
						throw new Error("Failed to update todo");
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
		},
		[mutate, todos]
	);
	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;

			if (active.id !== over.id) {
				const { id1, id2, position1, position2 } = {
					id1: active.id as number,
					id2: over!.id as number,
					position1: active!.data!.current!.position as number,
					position2: over!.data!.current!.position as number,
				};

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
		},
		[mutate, todos]
	);

	return (
		<div className="app">
			<h1>Todo List</h1>
			<input type="text" />
			<input type="text" name="" id="" />
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
						<SortableTodo key={todo.id} todo={todo} onDoneChanged={handleDoneChanged} />
					))}
				</SortableContext>
			</DndContext>
		</div>
	);
}

export default App;
function SortableTodo({
	todo,
	onDoneChanged,
	onDelete,
}: {
	todo: {
		id: number;
		created_at: string;
		description: string;
		done: boolean;
		headline: string;
		position: number;
	};
	onDoneChanged: (todo: Todo) => Promise<void>;
	onDelete: (todo: Todo) => Promise<void>;
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

	const className = todo.done ? "card card__grab card__done" : "card card__grab";
	return (
		<div className={className} ref={setNodeRef} style={style}>
			<div className="card--left">
				<h3>{todo.headline}</h3>
				<div className="card--description">{todo.description} </div>
			</div>
			<div className="card--right">
				<Switch
					round={true}
					checked={todo.done}
					onChange={() => onDoneChanged(todo)}
				></Switch>
				<button className="button--danger" onClick={() => onDelete(todo)}>
					&#128465;
				</button>
				<button {...listeners} {...attributes} className="button--handle">
					<svg viewBox="0 0 20 20" width="12">
						<path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
					</svg>
				</button>
			</div>
		</div>
	);
}
