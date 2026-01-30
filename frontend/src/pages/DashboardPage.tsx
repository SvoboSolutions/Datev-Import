import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";

import {
  fetchKpis,
  fetchMonthlyCosts,
  fetchPeriods,
  fetchTopEmployees,
  type Kpis,
  type MonthlyRow,
  type TopEmployeesResponse,
} from "../api/dashboard";
import { AccordionSection } from "../components/ui/AccordionSection";

import { money } from "../components/charts/formatters";
import { KpiCard } from "../components/dashboard/KpiCard";
import { PeriodSelect } from "../components/dashboard/PeriodSelect";

import { fetchHotspots, type HotspotPeriod } from "../api/dashboard";
import { HotspotsTable } from "../components/dashboard/charts/HotspotsTable";

import { CostTrendChart } from "../components/dashboard/charts/CostTrendChart";
import { CostBlocksChart } from "../components/dashboard/charts/CostBlocksChart";
import { ReimbursementsChart } from "../components/dashboard/charts/ReimbursementsChart";
import { TopEmployeesChart } from "../components/dashboard/charts/TopEmployeesChart";
import { CostPerHeadChart } from "../components/dashboard/charts/CostPerHeadChart";
import { MomChangeChart } from "../components/dashboard/charts/MomChangeChart";
import { ReimbursementRateChart } from "../components/dashboard/charts/ReimbursementRateChart";

function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-secondary">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="w-full sm:w-auto">{right}</div> : null}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-error/40 bg-red-50 px-4 py-3 text-sm text-error">
      {message}
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h3 className="text-md font-semibold text-primary">{title}</h3>
      {subtitle ? <span className="text-sm text-muted">{subtitle}</span> : null}
    </div>
  );
}

export function DashboardPage() {
  const [periods, setPeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [monthly, setMonthly] = useState<MonthlyRow[] | null>(null);
  const [top, setTop] = useState<TopEmployeesResponse | null>(null);
  const [hotspots, setHotspots] = useState<HotspotPeriod[] | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        setError(null);
        const [ps, m, hs] = await Promise.all([
          fetchPeriods(),
          fetchMonthlyCosts(),
          fetchHotspots(5),
        ]);
        setHotspots(hs);
        setPeriods(ps);
        setMonthly(m);
        setSelectedPeriod(ps[0] ?? (m.length ? m[m.length - 1].period : ""));
      } catch (e: any) {
        setError(e?.message ?? "Dashboard konnte nicht geladen werden");
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function loadPeriod() {
      if (!selectedPeriod) return;
      try {
        setError(null);
        const [k, t] = await Promise.all([
          fetchKpis(selectedPeriod),
          fetchTopEmployees(selectedPeriod, 5),
        ]);
        setKpis(k);
        setTop(t);
      } catch (e: any) {
        setError(e?.message ?? "Dashboard konnte nicht geladen werden");
      }
    }
    loadPeriod();
  }, [selectedPeriod]);

  const monthlyRows = useMemo(() => monthly ?? [], [monthly]);

  if (error) return <ErrorBanner message={error} />;

  if (!monthly || !selectedPeriod || !kpis || !top) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Dashboard"
        subtitle="KPIs, Trends und Hotspots aus deinen Imports"
        right={
          <div className="rounded-2xl border border-border/70 bg-surface/70 px-3 py-2 flex items-center gap-3">
            <div className="text-xs text-muted">Periode</div>
            <PeriodSelect
              periods={periods}
              value={selectedPeriod}
              onChange={setSelectedPeriod}
            />
          </div>
        }
      />

      <div className="rounded-3xl border border-border/60 bg-surface/40 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard label="Mitarbeiter" value={kpis.employee_count} />
          <KpiCard label="Gesamtkosten" value={money(kpis.total_cost)} accent />
          <KpiCard label="Gesamtbrutto" value={money(kpis.total_gross)} />
          <KpiCard label="SV-AG-Anteil" value={money(kpis.total_sv_ag)} />
          <KpiCard
            label="Letzter Import"
            value={kpis.last_import_status ?? "–"}
          />
        </div>

        <div className="mt-6">
          <SectionTitle
            title="Top Mitarbeiter"
            subtitle="Gesamtkosten in der Periode"
          />
          <TopEmployeesChart items={top.items} period={top.period} />
        </div>
      </div>

      <AccordionSection
        title="Gesamtentwicklung"
        subtitle="Alle importierten Monate (Historie)"
        defaultOpen={true}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <SectionTitle title="Gesamtkosten Trend" subtitle="Summe je Monat" />
            <CostTrendChart rows={monthlyRows} />
          </Card>

          <Card>
            <SectionTitle
              title="Kostenblöcke"
              subtitle="SV-AG · Umlage · bAV · Steuern"
            />
            <CostBlocksChart rows={monthlyRows} />
          </Card>

          <Card>
            <SectionTitle title="Erstattungen" subtitle="KK · BA · IfSG" />
            <ReimbursementsChart rows={monthlyRows} />
          </Card>

          <Card>
            <SectionTitle
              title="Gesamtkosten pro Kopf"
              subtitle="€ / Mitarbeiter je Monat"
            />
            <CostPerHeadChart rows={monthlyRows} />
          </Card>

          <Card>
            <SectionTitle
              title="Monat-zu-Monat Veränderung"
              subtitle="Δ Gesamtkosten (€, %)"
            />
            <MomChangeChart rows={monthlyRows} />
          </Card>

          <Card>
            <SectionTitle
              title="Erstattungsquote"
              subtitle="Erstattungen / Gesamtkosten"
            />
            <ReimbursementRateChart rows={monthlyRows} />
          </Card>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Hotspots"
        subtitle="Mitarbeiter mit den höchsten Gesamtkosten je Periode"
        defaultOpen={false}
      >
        <Card>
          <SectionTitle title="Hotspots" subtitle="Top Mitarbeiter je Monat" />
          <HotspotsTable data={hotspots ?? []} />
        </Card>
      </AccordionSection>
    </div>
  );
}
