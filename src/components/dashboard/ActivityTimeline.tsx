import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";

export type ActivityItem = {
  id: string;
  title: string;
  meta: string;
  to?: string;
  params?: Record<string, string>;
};

/**
 * Vertical timeline for dashboard activity. Items are derived from data the
 * dashboard already loads — this component never fetches anything.
 */
export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <section className="dash-surface p-6">
      <h2 className="text-lg font-semibold tracking-tight">Aktivitas Terbaru</h2>

      {items.length === 0 ? (
        <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-dash-line px-6 py-10 text-center">
          <span className="dash-icon-bubble size-12 rounded-2xl">
            <Activity className="size-5" />
          </span>
          <p className="mt-4 font-medium">Belum ada aktivitas terbaru</p>
          <p className="mt-1 text-sm text-dash-muted">
            Aktivitas organisasi akan muncul di sini.
          </p>
        </div>
      ) : (
        <ol className="mt-5 space-y-1">
          {items.map((item, i) => {
            const content = (
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="mt-1.5 size-2.5 rounded-full bg-dash-blue" />
                  {i < items.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-dash-line" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-5">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="mt-0.5 text-sm text-dash-muted">{item.meta}</p>
                </div>
              </div>
            );

            return (
              <li key={item.id}>
                {item.to ? (
                  <Link
                    to={item.to}
                    {...(item.params ? { params: item.params } : {})}
                    className="block rounded-xl px-2 transition-colors hover:bg-dash-blue-soft/50"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="px-2">{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
