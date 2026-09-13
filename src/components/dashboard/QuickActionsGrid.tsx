import { Link } from "@tanstack/react-router";
import { BriefcaseBusiness, CalendarDays, LifeBuoy, SquarePen } from "lucide-react";

/**
 * Shortcuts to existing routes only — no new routes, no data access.
 */
const actions = [
  { to: "/workspace", label: "Ruang Kerja", icon: BriefcaseBusiness },
  { to: "/workspace", label: "Buat Tugas", icon: SquarePen },
  { to: "/calendar", label: "Lihat Kalender", icon: CalendarDays },
  { to: "/help-requests", label: "Request Bantuan", icon: LifeBuoy },
] as const;

export function QuickActionsGrid() {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold tracking-wide text-dash-muted uppercase">Aksi Cepat</h2>
      <div className="dash-stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
        {actions.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="dash-card dash-quick flex items-center gap-3 p-4 text-sm font-medium"
          >
            <span className="dash-icon-bubble shrink-0">
              <a.icon className="size-4" />
            </span>
            <span className="min-w-0 truncate">{a.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
