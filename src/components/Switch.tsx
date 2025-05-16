import "./Switch.css";
export function Switch({
	round,
	checked,
	onChange,
}: {
	round?: boolean;
	checked: boolean;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
}) {
	const className = round ? "slider round" : "slider";
	return (
		<label className="switch">
			<input type="checkbox" checked={checked} onChange={onChange} />
			<span className={className}></span>
		</label>
	);
}
