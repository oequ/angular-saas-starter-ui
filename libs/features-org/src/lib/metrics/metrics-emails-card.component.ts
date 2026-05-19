import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  formatMetricsCount,
  formatMetricsPercent,
  type MetricsDashboard,
} from '@oequ/ports';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSelectImports } from '@spartan-ng/helm/select';

import { MetricsLineChartComponent } from './metrics-line-chart.component';

@Component({
  selector: 'oequ-metrics-emails-card',
  imports: [HlmCardImports, HlmSelectImports, MetricsLineChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      hlmCard
      variant="outline"
      class="bg-muted/30 ring-border/60 gap-0 overflow-hidden rounded-xl border-0 py-0 shadow-sm ring-1 ring-inset"
    >
      <div hlmCardContent class="!p-5">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-sm font-medium">Email volume</h2>
            <p class="text-muted-foreground text-xs">Sent over the selected period</p>
          </div>

          <hlm-select class="w-full sm:w-40" value="all_events">
            <hlm-select-trigger class="border-input h-9 w-full rounded-lg shadow-none">
              <span class="truncate">All Events</span>
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal class="w-[var(--brn-select-width)]">
              <hlm-select-item value="all_events">All Events</hlm-select-item>
            </hlm-select-content>
          </hlm-select>
        </div>

        <oequ-metrics-line-chart
          [labels]="seriesLabels()"
          [values]="seriesValues()"
          [yMax]="emailsYMax()"
          tickFormat="count"
          lineColor="oklch(0.62 0.17 145)"
          [fillArea]="true"
          [height]="240"
          ariaLabel="Emails sent over time"
        />

        @if (primaryDomain(); as domain) {
          <div class="mt-4 flex items-center justify-between gap-3">
            <span
              class="bg-muted/50 text-foreground inline-flex max-w-full min-w-0 items-center gap-2 rounded-full px-3 py-1 text-xs"
            >
              <span class="size-2 shrink-0 rounded-full bg-emerald-500"></span>
              <span class="truncate font-medium">{{ domain.domain }}</span>
              <span class="text-muted-foreground tabular-nums"
                >{{ formatMetricsCount(domain.count) }}</span
              >
            </span>
            <span class="text-muted-foreground shrink-0 text-xs tabular-nums">
              {{
                formatMetricsPercent(domain.deliverabilityRate, { decimals: 0 })
              }}
              deliverability
            </span>
          </div>
        }
      </div>
    </section>
  `,
})
export class MetricsEmailsCardComponent {
  readonly dashboard = input.required<MetricsDashboard>();

  protected readonly formatMetricsCount = formatMetricsCount;
  protected readonly formatMetricsPercent = formatMetricsPercent;

  protected readonly seriesLabels = computed(() =>
    this.dashboard().emailsSeries.points.map((point) => point.date),
  );

  protected readonly seriesValues = computed(() =>
    this.dashboard().emailsSeries.points.map((point) => point.value),
  );

  protected readonly emailsYMax = computed(() => {
    const max = Math.max(...this.seriesValues(), 0);
    return max > 0 ? Math.ceil(max * 1.15) : 12;
  });

  protected readonly primaryDomain = computed(
    () => this.dashboard().domainBreakdown[0] ?? null,
  );
}
