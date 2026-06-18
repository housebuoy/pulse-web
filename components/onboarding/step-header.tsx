export function StepHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10">
      <h2 className="mb-3 text-h1 text-fg">{title}</h2>
      <p className="text-body text-fg-muted">{description}</p>
    </div>
  );
}
