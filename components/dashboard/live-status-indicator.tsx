export function LiveStatusIndicator({ interval = "5s" }: { interval?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success"></span>
      </span>
      <span className="text-body-sm text-fg-muted">
        Live · updates every {interval}
      </span>
    </div>
  );
}
