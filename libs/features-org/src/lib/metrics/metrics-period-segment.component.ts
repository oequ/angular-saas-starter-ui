import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { MetricsPeriod } from '@oequ/ports';

const PERIOD_OPTIONS: readonly { value: MetricsPeriod; label: string }[] = [
  { value: '15d', label: '15d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
];

@Component({
  selector: 'oequ-metrics-period-segment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-muted/50 border-input inline-flex rounded-lg border p-0.5"
      role="group"
      aria-label="Time period"
    >
      @for (option of options; track option.value) {
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          [class]="
            value() === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          [attr.aria-pressed]="value() === option.value"
          (click)="periodChange.emit(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
})
export class MetricsPeriodSegmentComponent {
  readonly value = input.required<MetricsPeriod>();
  readonly periodChange = output<MetricsPeriod>();

  protected readonly options = PERIOD_OPTIONS;
}
