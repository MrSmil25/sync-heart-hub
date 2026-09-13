import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Boxes, UserCheck, Building2, BriefcaseBusiness, Handshake, Coins, Landmark, Receipt, CalendarDays } from "lucide-react";
import { useDivisions, useMyProfile, useProfiles, isSupervisor } from "@/hooks/useProfile";
import { fetchDeals } from "@/lib/deals";
import { fetchDashboardFinance } from "@/lib/transactions";
import { fetchEvents, formatEventDate } from "@/lib/events";
import { formatRupiah } from "@/lib/format";
import { canManageCash, fetchMyBills, fetchPendingClaims } from "@/lib/cash";
import { SupervisorOverview } from "@/components/assignments/SupervisorOverview";
import { UrgentBanners } from "@/components/announcements/UrgentBanners";
import { WelcomeGuideCard } from "@/components/WelcomeGuideCard";
import { MarketingDashboardCards } from "@/components/marketing/MarketingDashboardCards";
import { StakeholderDashboardCards } from "@/components/stakeholders/StakeholderDashboardCards";
import { QuickShortcuts } from "@/components/resources/QuickShortcuts";
import { ContentBalanceMiniCard } from "@/components/marketing/ContentBalanceMiniCard";
import { PerformanceReminderCard } from "@/components/marketing/PerformanceReminderCard";
import { LetterReviewCard } from "@/components/letters/LetterReviewCard";
import { countContributionsThisWeek, countUnacknowledgedCoaching, isKadiv } from "@/lib/hr";
import { countUnacknowledgedWarnings, fetchWarnings } from "@/lib/warnings";
import { fetchProposals, isEligibleVoter } from "@/lib/proposals";
import { isBPH } from "@/hooks/useProfile";
import { isBPHOrSupervisor } from "@/lib/hr";
import { fetchWallets } from "@/lib/finance-summary";
import { fetchCancelRequests } from "@/lib/cancel-requests";
import { fetchHelpRequests } from "@/lib/help-requests";
import { StatCard } from "@/components/dashboard/StatCard";
import { QuickActionsGrid } from "@/components/dashboard/QuickActionsGrid";
import { ActivityTimeline, type ActivityItem } from "@/components/dashboard/ActivityTimeline";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — OrgTool" },
      { name: "description", content: "Ringkasan anggota dan divisi organisasi kampus." },
      { property: "og:title", content: "Dashboard — OrgTool" },
      { property: "og:description", content: "Ringkasan anggota dan divisi organisasi kampus." },
    ],
  }),
  component: DashboardPage,
});

// StatCard, QuickActionsGrid dan ActivityTimeline: komponen presentasi murni.

function DashboardPage() {
  const { data: profile } = useMyProfile();
  const { data: profiles = [], isLoading } = useProfiles();
  const { data: divisions = [] } = useDivisions();

  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => fetchDeals() });
  const { data: finance } = useQuery({ queryKey: ["dashboard-finance"], queryFn: fetchDashboardFinance });
  const { data: events = [] } = useQuery({ queryKey: ["events"], queryFn: () => fetchEvents() });

  const canSeeWealth = ["Controller", "Ketua", "Waketu", "Supervisor"].includes(
    profile?.role ?? "",
  );
  const { data: wallets } = useQuery({
    queryKey: ["fin-wallets"],
    queryFn: fetchWallets,
    enabled: canSeeWealth,
  });

  const cashManager = canManageCash(profile?.role);
  const { data: myBills = [] } = useQuery({ queryKey: ["my-bills"], queryFn: fetchMyBills });
  const { data: pendingClaims = [] } = useQuery({
    queryKey: ["cash-pending-claims"],
    queryFn: fetchPendingClaims,
    enabled: cashManager,
  });
  const unpaidBills = myBills.filter(
    (b) => b.status === "Belum_Bayar" || b.status === "Ditolak",
  ).length;

  const { data: unreadCoaching = 0 } = useQuery({
    queryKey: ["coaching-unread", profile?.id],
    queryFn: () => countUnacknowledgedCoaching(profile!.id),
    enabled: !!profile?.id,
  });
  const { data: weeklyContributions = 0 } = useQuery({
    queryKey: ["contributions-week", profile?.id],
    queryFn: () => countContributionsThisWeek(profile!.id),
    enabled: !!profile?.id,
  });

  const { data: unackWarnings = 0 } = useQuery({
    queryKey: ["warnings-unack", profile?.id],
    queryFn: () => countUnacknowledgedWarnings(profile!.id),
    enabled: !!profile?.id,
  });

  const kadiv = isKadiv(profile?.role);
  const { data: divisionWarnings = [] } = useQuery({
    queryKey: ["warnings", "division-active", profile?.division],
    queryFn: () => fetchWarnings({ activeOnly: true }),
    enabled: kadiv && !!profile?.division,
  });
  const divisionWarningCount = divisionWarnings.filter(
    (w) => w.member?.division === profile?.division,
  ).length;

  const { data: cancelRequests = [] } = useQuery({
    queryKey: ["cancel-requests"],
    queryFn: fetchCancelRequests,
    enabled: !!profile?.id,
  });
  const { data: helpRequests = [] } = useQuery({
    queryKey: ["help-requests"],
    queryFn: fetchHelpRequests,
    enabled: !!profile?.id,
  });
  const myPendingCancels = cancelRequests.filter(
    (r) => r.status === "Pending" && r.requested_by === profile?.id,
  ).length;
  const myPendingHelp = helpRequests.filter(
    (r) => r.status === "Pending" && r.requested_by === profile?.id,
  ).length;
  const decisionsWaiting =
    cancelRequests.filter((r) => r.status === "Pending" && r.requested_by !== profile?.id).length +
    helpRequests.filter(
      (r) =>
        r.status === "Pending" &&
        r.requested_by !== profile?.id &&
        r.target_division === profile?.division,
    ).length;

  const bphOrSupervisor = isBPH(profile?.role) || isBPHOrSupervisor(profile?.role);
  const { data: proposals = [] } = useQuery({
    queryKey: ["proposals"],
    queryFn: fetchProposals,
    enabled: !!profile?.id,
  });
  const activeProposals = proposals.filter((p) => p.status === "Voting");
  const myVoteProposals = activeProposals.filter((p) =>
    isEligibleVoter(p, profile ? { id: profile.id, division: profile.division } : null),
  );
  const proposalsAboutMe = activeProposals.filter((p) => p.target_member_id === profile?.id);


  const activeEvents = events.filter((e) =>
    ["Planning", "Preparation", "Live"].includes(e.status ?? ""),
  );
  const myPicEvents = activeEvents.filter((e) => e.pic_id && e.pic_id === profile?.id);
  const upcomingEvent = [...events]
    .filter((e) => e.date_start && new Date(e.date_start).getTime() >= Date.now() - 86400000)
    .sort((a, b) => new Date(a.date_start!).getTime() - new Date(b.date_start!).getTime())[0];

  const activeDeals = deals.filter(
    (d) => d.stage !== "Deal" && d.stage !== "Rejected" && d.stage !== "Ghosted",
  ).length;
  const pipelineValue = deals
    .filter((d) => ["Prospect", "Contacted", "Pitched", "Negotiating"].includes(d.stage))
    .reduce((s, d) => s + Number(d.value_idr ?? 0), 0);

  const totalAnggota = profiles.length;
  const anggotaAktif = profiles.filter((p) => p.status === "Active").length;
  const myDivision = divisions.find((d) => d.code === profile?.division);

  // Timeline dibangun dari data yang sudah dimuat di atas — tanpa query baru.
  const activityItems: ActivityItem[] = [
    ...(upcomingEvent
      ? [
          {
            id: `upcoming-${upcomingEvent.id}`,
            title: `Event berikutnya: ${upcomingEvent.name}`,
            meta: `${formatEventDate(upcomingEvent.date_start, upcomingEvent.date_end)}${
              upcomingEvent.venue ? ` — ${upcomingEvent.venue}` : ""
            }`,
            to: "/events/$id",
            params: { id: upcomingEvent.id },
          } satisfies ActivityItem,
        ]
      : []),
    ...myPicEvents.map(
      (e) =>
        ({
          id: `pic-${e.id}`,
          title: `Kamu PIC untuk ${e.name}`,
          meta: `${formatEventDate(e.date_start, e.date_end)} · ${e.status}`,
          to: "/events/$id",
          params: { id: e.id },
        }) satisfies ActivityItem,
    ),
  ];

  return (
    <div className="dash-atmosphere mx-auto max-w-6xl space-y-6">
      {unackWarnings > 0 && (
        <Link
          to="/warnings"
          className="block rounded-2xl border-2 border-red-400 bg-red-50 p-5 font-semibold text-red-900 shadow-sm transition-colors hover:bg-red-100"
        >
          Kamu punya {unackWarnings} peringatan yang perlu dibaca. Klik untuk membukanya.
        </Link>
      )}

      {proposalsAboutMe.map((p) => (
        <Link
          key={p.id}
          to="/warnings/proposals/$id"
          params={{ id: p.id }}
          className="block rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 font-semibold text-amber-900 shadow-sm transition-colors hover:bg-amber-100"
        >
          Ada usulan peringatan untuk kamu. Kamu berhak menyanggah.
        </Link>
      ))}

      {canSeeWealth && (
        <Link
          to="/finance-summary"
          className="block rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/40"
        >
          <p className="text-sm text-muted-foreground">Total Kekayaan</p>
          <p className="mt-1 text-3xl font-bold tracking-tight break-words">
            {wallets ? formatRupiah(wallets.total_saldo) : "…"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {wallets
              ? `Ops: ${formatRupiah(wallets.ops_saldo)} · Kas: ${formatRupiah(wallets.kas_saldo)}`
              : "Memuat ringkasan dompet…"}
          </p>
        </Link>
      )}

      {myPendingCancels > 0 && (
        <Link
          to="/workspace"
          className="block rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/40"
        >
          Permintaan batal task kamu ({myPendingCancels}) masih menunggu keputusan Kadiv.
        </Link>
      )}

      {myPendingHelp > 0 && (
        <Link
          to="/help-requests"
          className="block rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/40"
        >
          Request bantuan kamu ({myPendingHelp}) menunggu keputusan Kadiv divisi tujuan.
        </Link>
      )}

      {kadiv && decisionsWaiting > 0 && (
        <Link
          to="/help-requests"
          className="block rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm transition-colors hover:bg-amber-100"
        >
          {decisionsWaiting} permintaan menunggu keputusanmu.
        </Link>
      )}

      <UrgentBanners />
      <StakeholderDashboardCards />
      <MarketingDashboardCards />
      <PerformanceReminderCard />
      <LetterReviewCard />
      <WelcomeGuideCard />
      <QuickShortcuts />
      {(isBPH(profile?.role) || (profile?.role === "Kadiv" && profile?.division === "KRD")) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ContentBalanceMiniCard />
        </div>
      )}

      {myVoteProposals.length > 0 && (
        <Link
          to="/warnings/proposals"
          className="block rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/40"
        >
          Ada <span className="font-semibold">{myVoteProposals.length}</span> usulan peringatan
          menunggu suara kamu.
        </Link>
      )}

      {bphOrSupervisor && activeProposals.length > 0 && (
        <Link
          to="/warnings/proposals"
          className="block rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/40"
        >
          Usulan aktif di organisasi:{" "}
          <span className="font-semibold">{activeProposals.length}</span>
        </Link>
      )}

      {kadiv && divisionWarningCount > 0 && (
        <Link
          to="/warnings"
          className="block rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/40"
        >
          SP aktif di divisi kamu:{" "}
          <span className="font-semibold">{divisionWarningCount}</span>
        </Link>
      )}

      {unpaidBills > 0 && (
        <Link
          to="/cash"
          className="block rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm transition-colors hover:bg-amber-100"
        >
          Kamu punya {unpaidBills} tagihan kas belum dibayar. Klik untuk membayar.
        </Link>
      )}

      {cashManager && pendingClaims.length > 0 && (
        <Link
          to="/cash"
          className="block rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/40"
        >
          Klaim menunggu verifikasi: <span className="font-semibold">{pendingClaims.length}</span>
        </Link>
      )}

      {unreadCoaching > 0 && (
        <Link
          to="/coaching"
          className="block rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/40"
        >
          Ada {unreadCoaching} catatan bimbingan yang belum kamu baca. Klik untuk membukanya.
        </Link>
      )}

      {weeklyContributions > 0 && (
        <Link
          to="/contributions"
          className="block rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-sm transition-colors hover:bg-emerald-100"
        >
          Minggu ini kamu mendapat {weeklyContributions} apresiasi dari rekan. Terima kasih sudah
          hadir untuk tim.
        </Link>
      )}

      {isSupervisor(profile?.role) && <SupervisorOverview />}

      <section className="dash-hero dash-enter p-6 sm:p-10">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-dash-muted uppercase">
            Ruang untuk bertumbuh
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Halo, {profile?.nickname || profile?.full_name || "Anggota"}!
          </h1>
          <p className="mt-2 text-base text-dash-muted">
            Mari lanjutkan langkah baik hari ini.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 rounded-xl bg-dash-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform duration-200 hover:scale-[1.02]"
            >
              <BriefcaseBusiness className="size-4" />
              Buka Ruang Kerja Saya
            </Link>
            <Link
              to="/guide"
              className="inline-flex items-center gap-2 rounded-xl border border-dash-line bg-white/70 px-4 py-2.5 text-sm font-semibold text-dash-navy backdrop-blur transition-transform duration-200 hover:scale-[1.02] dark:bg-card dark:text-foreground"
            >
              Lihat Panduan
            </Link>
          </div>
        </div>
      </section>

      <QuickActionsGrid />

      <section className="dash-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Anggota" value={isLoading ? "…" : totalAnggota} icon={Users} />
        <StatCard label="Total Divisi" value={divisions.length || "…"} icon={Boxes} />
        <StatCard label="Anggota Aktif" value={isLoading ? "…" : anggotaAktif} icon={UserCheck} />
        <StatCard
          label="Divisi Saya"
          value={myDivision?.code ?? "-"}
          icon={Building2}
        />
        <StatCard label="Deal Aktif" value={activeDeals} icon={Handshake} />
        <StatCard label="Total Pipeline Value" value={formatRupiah(pipelineValue)} icon={Coins} />
        <StatCard
          label="Saldo Organisasi"
          value={finance ? formatRupiah(finance.balance) : "…"}
          icon={Landmark}
          valueClassName={finance ? (finance.balance >= 0 ? "text-emerald-600" : "text-red-600") : ""}
        />
        <StatCard
          label="Expense Bulan Ini"
          value={finance ? formatRupiah(finance.monthExpense) : "…"}
          icon={Receipt}
          valueClassName="text-red-600"
        />
        <StatCard label="Event Aktif" value={activeEvents.length} icon={CalendarDays} />

      </section>

      <ActivityTimeline items={activityItems} />

      {myDivision && (
        <section className="dash-surface relative overflow-hidden p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-dash-blue-soft/60 blur-2xl"
          />
          <div className="relative flex items-start gap-4">
            <span className="dash-icon-bubble shrink-0">
              <Building2 className="size-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight">Divisi {myDivision.name}</h2>
              <p className="mt-1 text-sm text-dash-muted">
                {myDivision.description ?? "Belum ada deskripsi divisi."}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
