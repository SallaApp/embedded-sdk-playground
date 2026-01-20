export default function Checkbox({ checked, onChange, label, id, ...props }) {
  const checkboxId =
    id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <label className="filter-checkbox" htmlFor={checkboxId}>
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  );
}
