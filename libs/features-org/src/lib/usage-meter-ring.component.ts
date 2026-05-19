import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'oequ-usage-meter-ring',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (unavailable()) {
      <span
        class="border-muted-foreground/30 inline-flex size-5 rounded-full border"
        aria-hidden="true"
      ></span>
    } @else {
      <svg
        class="size-5 -rotate-90"
        viewBox="0 0 20 20"
        role="progressbar"
        [attr.aria-valuenow]="percent() ?? 0"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="none"
          class="stroke-muted/40"
          stroke-width="2"
        />
        @if (percent() !== null) {
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            class="stroke-[var(--toast-success)] transition-[stroke-dashoffset]"
            stroke-width="2"
            stroke-linecap="round"
            [attr.stroke-dasharray]="circumference"
            [attr.stroke-dashoffset]="dashOffset()"
          />
        }
      </svg>
    }
  `,
})
export class UsageMeterRingComponent {
  readonly percent = input<number | null>(null);
  readonly unavailable = input(false);

  protected readonly circumference = 2 * Math.PI * 8;

  protected readonly dashOffset = computed(() => {
    const percent = this.percent();
    if (percent === null) {
      return this.circumference;
    }
    return this.circumference - (percent / 100) * this.circumference;
  });
}
