export function formatTimestamp(epochMs: number): string {
  const date = new Date(epochMs);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
