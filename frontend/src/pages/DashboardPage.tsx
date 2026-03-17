import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import {
  fetchKpis,
  fetchMonthlyCosts,
  type Kpis,
  type MonthlyRow,
  fetchHotspots,
  type HotspotPeriod,
} from "../api/dashboard";

import { AccordionSection } from "../components/ui/AccordionSection";
import { money } from "../components/charts/formatters";
import { KpiCard } from "../components/dashboard/KpiCard";

import { HotspotsTable } from "../components/dashboard/charts/HotspotsTable";
import { CostTrendChart } from "../components/dashboard/charts/CostTrendChart";
import { CostPerHeadChart } from "../components/dashboard/charts/CostPerHeadChart";
import { MomChangeChart } from "../components/dashboard/charts/MomChangeChart";

type RangeOption =
  | "last12"
  | "currentYear"
  | "allYears"
  | `year:${number}`;

function HeroBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface/70 p-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-accent/15 via-transparent to-accent/5" />
      <div className="pointer-events-none absolute -bottom-20 -left-24 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            {title}
          </h1>
          {subtitle ? <p className="mt-1 text-sm text-secondary">{subtitle}</p> : null}
        </div>
      </div>
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

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-md font-semibold text-primary">{title}</h3>
      {subtitle ? <span className="text-sm text-muted">{subtitle}</span> : null}
    </div>
  );
}

function getYear(period: string): number | null {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  return match ? Number(match[1]) : null;
}

function getMonthIndex(period: string): number | null {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  return year * 12 + month;
}

function comparePeriodsAsc(a: string, b: string) {
  return a.localeCompare(b);
}

function buildRangeLabel(range: RangeOption, currentYear: number | null) {
  if (range === "last12") return "Letzte 12 Monate";
  if (range === "allYears") return "Alle Jahre";
  if (range === "currentYear") return currentYear ? `Jahr ${currentYear}` : "Aktuelles Jahr";
  if (range.startsWith("year:")) return `Jahr ${range.slice(5)}`;
  return "Zeitraum";
}

function RangeSelect({
  availableYears,
  value,
  onChange,
  currentYear,
}: {
  availableYears: number[];
  value: RangeOption;
  onChange: (value: RangeOption) => void;
  currentYear: number | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium text-secondary">Zeitraum</span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as RangeOption)}
        className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-primary shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        <option value="last12">Letzte 12 Monate</option>
        <option value="currentYear">
          {currentYear ? `Aktuelles Jahr (${currentYear})` : "Aktuelles Jahr"}
        </option>
        <option value="allYears">Alle Jahre</option>

        {availableYears.map((year) => (
          <option key={year} value={`year:${year}`}>
            Jahr {year}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DashboardPage() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [monthly, setMonthly] = useState<MonthlyRow[] | null>(null);
  const [hotspots, setHotspots] = useState<HotspotPeriod[] | null>(null);
  const [range, setRange] = useState<RangeOption>("last12");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);

        const [monthlyRes, hotspotRes] = await Promise.all([
          fetchMonthlyCosts(),
          fetchHotspots(5),
        ]);

        setMonthly(monthlyRes);
        setHotspots(hotspotRes);
      } catch (e: any) {
        setError(e?.message ?? "Dashboard konnte nicht geladen werden");
      }
    })();
  }, []);

  const monthlyRows = useMemo(() => {
    return [...(monthly ?? [])].sort((a, b) => comparePeriodsAsc(a.period, b.period));
  }, [monthly]);

  const latestPeriod = useMemo(() => {
    return monthlyRows.length ? monthlyRows[monthlyRows.length - 1].period : null;
  }, [monthlyRows]);

  useEffect(() => {
    (async () => {
      if (!latestPeriod) return;

      try {
        setError(null);
        const kpiRes = await fetchKpis(latestPeriod);
        setKpis(kpiRes);
      } catch (e: any) {
        setError(e?.message ?? "Dashboard konnte nicht geladen werden");
      }
    })();
  }, [latestPeriod]);

  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        monthlyRows
          .map((row) => getYear(row.period))
          .filter((year): year is number => year !== null),
      ),
    ).sort((a, b) => b - a);
  }, [monthlyRows]);

  const currentYearFromData = latestPeriod ? getYear(latestPeriod) : null;

  const filteredMonthlyRows = useMemo(() => {
    if (!monthlyRows.length) return [];

    if (range === "allYears") return monthlyRows;

    if (range === "currentYear") {
      if (!currentYearFromData) return monthlyRows;
      return monthlyRows.filter((row) => getYear(row.period) === currentYearFromData);
    }

    if (range === "last12") {
      const latestIndex = latestPeriod ? getMonthIndex(latestPeriod) : null;
      if (latestIndex === null) return monthlyRows;

      return monthlyRows.filter((row) => {
        const index = getMonthIndex(row.period);
        return index !== null && index >= latestIndex - 11 && index <= latestIndex;
      });
    }

    if (range.startsWith("year:")) {
      const year = Number(range.slice(5));
      return monthlyRows.filter((row) => getYear(row.period) === year);
    }

    return monthlyRows;
  }, [monthlyRows, range, latestPeriod, currentYearFromData]);

  const filteredHotspots = useMemo(() => {
    const allowedPeriods = new Set(filteredMonthlyRows.map((row) => row.period));
    return (hotspots ?? []).filter((row) => allowedPeriods.has(row.period));
  }, [hotspots, filteredMonthlyRows]);

  const totalCostForRange = useMemo(() => {
    return filteredMonthlyRows.reduce((sum, row) => sum + Number(row.total_cost ?? 0), 0);
  }, [filteredMonthlyRows]);

  const latestPeriodTotalCost = useMemo(() => {
    if (!latestPeriod) return 0;
    const row = monthlyRows.find((item) => item.period === latestPeriod);
    return Number(row?.total_cost ?? 0);
  }, [monthlyRows, latestPeriod]);

  const rangeLabel = useMemo(
    () => buildRangeLabel(range, currentYearFromData),
    [range, currentYearFromData],
  );

  if (error) return <ErrorBanner message={error} />;

  if (!monthly || !kpis) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <HeroBar
        title="Dashboard"
        subtitle="KPIs, Trends und Hotspots aus deinen Imports"
      />

      <div className="overflow-hidden rounded-3xl border border-border/60 bg-surface/50">
        <div className="h-1.5 bg-gradient-to-r from-accent/80 via-accent/30 to-transparent" />
        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard label="Mitarbeiter" value={kpis.employee_count} />
            <KpiCard
              label="Gesamtkosten aktuellste Periode"
              value={money(latestPeriodTotalCost)}
              accent
            />
            <KpiCard
              label="Gesamtkosten ausgewählter Zeitraum"
              value={money(totalCostForRange)}
            />
          </div>
        </div>
      </div>

      <AccordionSection
        title="Gesamtkostenentwicklung"
        subtitle={rangeLabel}
        defaultOpen
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <RangeSelect
            availableYears={availableYears}
            value={range}
            onChange={setRange}
            currentYear={currentYearFromData}
          />

          <div className="rounded-2xl border border-accent/25 bg-accent/10 px-3 py-2 text-sm text-secondary">
            {filteredMonthlyRows.length} Monate im Zeitraum
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card>
            <SectionTitle title="Gesamtkosten Trend" subtitle={rangeLabel} />
            <CostTrendChart rows={filteredMonthlyRows} />
          </Card>

          <Card>
            <SectionTitle title="Gesamtkosten pro Kopf" subtitle={rangeLabel} />
            <CostPerHeadChart rows={filteredMonthlyRows} />
          </Card>

          <Card>
            <SectionTitle title="Monat-zu-Monat Veränderung" subtitle={rangeLabel} />
            <MomChangeChart rows={filteredMonthlyRows} />
          </Card>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Hotspots"
        subtitle={`Mitarbeiter mit den höchsten Gesamtkosten · ${rangeLabel}`}
        defaultOpen={false}
      >
        <Card>
          <SectionTitle title="Hotspots" subtitle={rangeLabel} />
          <HotspotsTable data={filteredHotspots} />
        </Card>
      </AccordionSection>
    </div>
  );
}