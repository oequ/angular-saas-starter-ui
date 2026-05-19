import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

@Component({
  selector: 'oequ-metrics-page-skeleton',
  imports: [HlmSkeletonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        @for (_ of kpiSlots; track $index) {
          <div class="bg-muted/30 ring-border/60 rounded-xl px-4 py-3 ring-1 ring-inset">
            <hlm-skeleton class="h-3 w-20" />
            <hlm-skeleton class="mt-3 h-8 w-24" />
            <hlm-skeleton class="mt-2 h-3 w-28" />
          </div>
        }
      </div>

      <div class="bg-muted/30 ring-border/60 rounded-xl p-5 ring-1 ring-inset">
        <div class="mb-4 flex justify-between gap-3">
          <hlm-skeleton class="h-5 w-32" />
          <hlm-skeleton class="h-9 w-36" />
        </div>
        <hlm-skeleton class="h-[220px] w-full rounded-lg" />
        <hlm-skeleton class="mt-4 h-4 w-48" />
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        @for (_ of chartSlots; track $index) {
          <div class="bg-muted/30 ring-border/60 rounded-xl p-5 ring-1 ring-inset">
            <hlm-skeleton class="h-3 w-24" />
            <hlm-skeleton class="mt-3 h-8 w-16" />
            <hlm-skeleton class="mt-4 h-[160px] w-full rounded-lg" />
            <div class="mt-4 flex gap-3">
              <hlm-skeleton class="h-3 w-20" />
              <hlm-skeleton class="h-3 w-20" />
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class MetricsPageSkeletonComponent {
  protected readonly kpiSlots = [0, 1, 2, 3] as const;
  protected readonly chartSlots = [0, 1] as const;
}
