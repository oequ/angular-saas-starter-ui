import type { MetricsPeriod } from './models/metrics.model';

export function formatMetricsCount(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    value,
  );
}

export function formatMetricsPercent(
  value: number,
  options?: { decimals?: number },
): string {
  const decimals = options?.decimals ?? (value > 0 && value < 1 ? 2 : 0);
  return `${value.toFixed(decimals)}%`;
}

export function metricsPeriodLabel(period: MetricsPeriod): string {
  switch (period) {
    case '15d':
      return 'Last 15 days';
    case '30d':
      return 'Last 30 days';
    case '90d':
      return 'Last 90 days';
  }
}

export function formatMetricsChartDate(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
  }).format(date);
}

export function formatMetricsDeltaPercent(value: number): string {
  if (value === 0) {
    return 'No change';
  }
  const arrow = value > 0 ? '↑' : '↓';
  return `${arrow} ${Math.abs(value)}%`;
}

export function formatMetricsDeltaPoints(value: number): string {
  if (value === 0) {
    return 'No change';
  }
  const arrow = value > 0 ? '↑' : '↓';
  const suffix = Math.abs(value) === 1 ? 'pt' : 'pts';
  return `${arrow} ${Math.abs(value)} ${suffix}`;
}

export function formatMetricsLastUpdated(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
