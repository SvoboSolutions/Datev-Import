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

export function DashboardPage() {
  const [periods, setPeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [monthly, setMonthly] = useState<MonthlyRow[] | null>(null);
  const [top, setTop] = useState<TopEmployeesResponse | null>(null);
  const [hotspots, setHotspots] = useState<HotspotPeriod[] | null>(null);

  const [error, setError] = useState<string | null>(null);

  // global data
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

  // period data
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

  if (error) {
    return (
      <div className="rounded-lg border border-error bg-red-50 px-4 py-3 text-sm text-error">
        {error}
      </div>
    );
  }

  if (!monthly || !selectedPeriod || !kpis || !top) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AccordionSection
        title="Periode"
        subtitle="KPIs & Top Mitarbeiter für die ausgewählte Periode"
        defaultOpen={true}
      >
        <div className="flex justify-end pt-1 pb-4">
          <PeriodSelect
            periods={periods}
            value={selectedPeriod}
            onChange={setSelectedPeriod}
          />
        </div>

        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard label="Mitarbeiter" value={kpis.employee_count} />
            <KpiCard
              label="Gesamtkosten"
              value={money(kpis.total_cost)}
              accent
            />
            <KpiCard label="Gesamtbrutto" value={money(kpis.total_gross)} />
            <KpiCard label="SV-AG-Anteil" value={money(kpis.total_sv_ag)} />
            <KpiCard
              label="Letzter Import"
              value={kpis.last_import_status ?? "–"}
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-medium text-primary">
                Top Mitarbeiter
              </h3>
              <span className="text-sm text-muted">
                Gesamtkosten in der Periode
              </span>
            </div>
            <TopEmployeesChart items={top.items} period={top.period} />
          </div>
        </Card>
      </AccordionSection>
      <AccordionSection
        title="Gesamtentwicklung"
        subtitle="Alle importierten Monate (Historie)"
        defaultOpen={true}
      >
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-primary">
                  Gesamtkosten Trend
                </h3>
                <span className="text-sm text-muted">Summe je Monat</span>
              </div>
              <CostTrendChart rows={monthlyRows} />
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-primary">
                  Kostenblöcke
                </h3>
                <span className="text-sm text-muted">
                  SV-AG · Umlage · bAV · Steuern
                </span>
              </div>
              <CostBlocksChart rows={monthlyRows} />
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-primary">
                  Erstattungen
                </h3>
                <span className="text-sm text-muted">KK · BA · IfSG</span>
              </div>
              <ReimbursementsChart rows={monthlyRows} />
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-primary">
                  Gesamtkosten pro Kopf
                </h3>
                <span className="text-sm text-muted">
                  € / Mitarbeiter je Monat
                </span>
              </div>
              <CostPerHeadChart rows={monthlyRows} />
            </Card>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-primary">
                  Monat-zu-Monat Veränderung
                </h3>
                <span className="text-sm text-muted">
                  Δ Gesamtkosten (€, %)
                </span>
              </div>
              <MomChangeChart rows={monthlyRows} />
            </Card>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-medium text-primary">
                  Erstattungsquote
                </h3>
                <span className="text-sm text-muted">
                  Erstattungen / Gesamtkosten
                </span>
              </div>
              <ReimbursementRateChart rows={monthlyRows} />
            </Card>
          </div>
        </div>
      </AccordionSection>
      <AccordionSection
        title="Hotspots"
        subtitle="Mitarbeiter mit den höchsten Gesamtkosten je Periode"
        defaultOpen={false}
      >
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-primary">Hotspots</h3>
            <span className="text-sm text-muted">Top Mitarbeiter je Monat</span>
          </div>
          <HotspotsTable data={hotspots ?? []} />
        </Card>
      </AccordionSection>
    </div>
  );
}
