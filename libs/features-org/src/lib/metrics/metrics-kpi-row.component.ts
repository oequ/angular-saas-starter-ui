import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  formatMetricsCount,
  formatMetricsDeltaPercent,
  formatMetricsDeltaPoints,
  formatMetricsPercent,
  type MetricsDashboard,
} from '@oequ/ports';

@Component({
  selector: 'oequ-metrics-kpi-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      @for (kpi of kpis(); track kpi.label) {
        <div
          class="bg-muted/30 ring-border/60 rounded-xl px-4 py-3 ring-1 ring-inset"
        >
          <p class="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {{ kpi.label }}
          </p>
          <p class="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
            {{ kpi.value }}
          </p>
          <p
            class="mt-1 text-xs tabular-nums"
            [class]="kpi.deltaTone === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : kpi.deltaTone === 'negative' ? 'text-destructive' : 'text-muted-foreground'"
          >
            {{ kpi.delta }}
            <span class="text-muted-foreground font-normal"> vs prev period</span>
          </p>
        </div>
      }
    </div>
  `,
})
export class MetricsKpiRowComponent {
  readonly dashboard = input.required<MetricsDashboard>();

  protected readonly kpis = computed(() => {
    const data = this.dashboard();
    const { summary, comparison, bounce, complain } = data;

    return [
      {
        label: 'Emails sent',
        value: formatMetricsCount(summary.emailsSent),
        delta: formatMetricsDeltaPercent(comparison.emailsSentPercent),
        deltaTone: toneFromPercent(comparison.emailsSentPercent),
      },
      {
        label: 'Deliverability',
        value: formatMetricsPercent(summary.deliverabilityRate, { decimals: 0 }),
        delta: formatMetricsDeltaPoints(comparison.deliverabilityRatePoints),
        deltaTone: toneFromPoints(comparison.deliverabilityRatePoints, true),
      },
      {
        label: 'Bounce rate',
        value: formatMetricsPercent(bounce.rate, { decimals: 2 }),
        delta: formatMetricsDeltaPoints(comparison.bounceRatePoints),
        deltaTone: toneFromPoints(comparison.bounceRatePoints, false),
      },
      {
        label: 'Complain rate',
        value: formatMetricsPercent(complain.rate, { decimals: 2 }),
        delta: formatMetricsDeltaPoints(comparison.complainRatePoints),
        deltaTone: toneFromPoints(comparison.complainRatePoints, false),
      },
    ] as const;
  });
}

function toneFromPercent(value: number): 'positive' | 'negative' | 'neutral' {
  if (value === 0) {
    return 'neutral';
  }
  return value > 0 ? 'positive' : 'negative';
}

function toneFromPoints(
  value: number,
  higherIsBetter: boolean,
): 'positive' | 'negative' | 'neutral' {
  if (value === 0) {
    return 'neutral';
  }
  const positive = higherIsBetter ? value > 0 : value < 0;
  return positive ? 'positive' : 'negative';
}
