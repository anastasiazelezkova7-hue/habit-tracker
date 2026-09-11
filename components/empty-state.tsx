import Icon from "./icon";

export default function EmptyState({
  icon = "Sprout",
  title,
  subtitle,
  action,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
      <span className="mb-4 grid h-20 w-20 place-items-center rounded-full bg-primary-wash text-primary-stronger">
        <Icon name={icon} size={36} strokeWidth={1.6} />
      </span>
      <h3 className="font-display text-xl font-bold text-secondary">{title}</h3>
      {subtitle && (
        <p className="mt-1.5 max-w-sm text-sm text-muted">{subtitle}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}