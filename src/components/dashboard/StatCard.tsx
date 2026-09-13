import type { ElementType } from "react";
import { TrendingUp } from "lucide-react";

/**
 * Presentational stat card for the dashboard. No data fetching — values are
 * passed in by the dashboard route exactly as before.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  valueClassName = "",
  trend,
  spark = [38, 52, 44, 61, 55, 72, 66],
}: {
  label: string;
  value: string | number;
  icon: ElementType;
  valueClassName?: string;
  trend?: string;
  spark?: number[];
}) {
  const max = Math.max(...spark, 1);
  const points = spark
    .map((v, i) => `${(i / (spark.length - 1)) * 100},${28 - (v / max) * 24}`)
    .join(" ");

  return (
    <div className="dash-card group p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-dash-muted">{label}</p>
        <span className="dash-icon-bubble shrink-0 group-hover:-translate-y-0.5">
          <Icon className="size-4" />
        </span>
      </div>

      <p className={`mt-4 text-3xl font-semibold tracking-tight break-words ${valueClassName}`}>
        {value}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="flex items-center gap-1 text-xs text-dash-muted">
          <TrendingUp className="size-3.5 text-dash-success" />
          {trend ?? "Stabil dari bulan lalu"}
        </p>
        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="h-7 w-20 shrink-0 opacity-70"
        >
          <polyline
            points={points}
            fill="none"
            stroke="var(--dash-blue)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
