import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

@Component({
  selector: 'oequ-usage-page-skeleton',
  imports: [HlmSkeletonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="border-border flex flex-col gap-4 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <hlm-skeleton class="h-9 w-full max-w-[220px] rounded-md" />
      <hlm-skeleton class="h-4 w-full max-w-sm rounded-md sm:w-72" />
    </div>

    <div class="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <aside class="space-y-6">
        <div class="space-y-3">
          <hlm-skeleton class="h-7 w-40 rounded-md" />
          <hlm-skeleton class="h-4 w-full rounded-md" />
          <hlm-skeleton class="h-4 w-full rounded-md" />
          <hlm-skeleton class="h-4 w-[80%] rounded-md" />
        </div>

        <div class="space-y-3">
          <hlm-skeleton class="h-3 w-28 rounded-md" />
          <hlm-skeleton class="h-4 w-36 rounded-md" />
          <hlm-skeleton class="h-4 w-32 rounded-md" />
        </div>
      </aside>

      <div class="grid gap-x-8 gap-y-0 sm:grid-cols-2">
        @for (_ of meterSlots; track $index) {
          <div
            class="border-border flex items-start justify-between gap-4 border-b py-4 last:border-b-0"
          >
            <div class="min-w-0 flex-1 space-y-2">
              <hlm-skeleton class="h-4 w-32 rounded-md" />
              <hlm-skeleton class="h-4 w-24 rounded-md" />
            </div>
            <hlm-skeleton class="size-5 shrink-0 rounded-full" />
          </div>
        }
      </div>
    </div>
  `,
})
export class UsagePageSkeletonComponent {
  protected readonly meterSlots = [0, 1, 2, 3, 4, 5, 6, 7] as const;
}
