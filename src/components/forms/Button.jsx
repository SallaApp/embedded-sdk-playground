export default function Button({
  variant = "default",
  size = "default",
  event = false,
  label,
  hint,
  children,
  className = "",
  ...props
}) {
  const baseClasses = "btn";
  const variantClasses = {
    default: "",
    primary: "btn-primary",
    success: "btn-success",
    danger: "btn-danger",
    warning: "btn-warning",
    accent: "btn-accent",
    info: "btn-info",
    toggle: "btn-toggle",
  };
  const sizeClasses = {
    default: "",
    small: "btn-small",
    icon: "btn-icon",
  };

  const classes = [
    baseClasses,
    variantClasses[variant] || "",
    sizeClasses[size] || "",
    event ? "btn-event" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Event buttons have a specific structure with label and hint
  if (event) {
    return (
      <button className={classes} {...props}>
        {label && <span className="btn-label">{label}</span>}
        {hint && <span className="btn-hint">{hint}</span>}
        {children}
      </button>
    );
  }

  // Regular buttons just render children
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
