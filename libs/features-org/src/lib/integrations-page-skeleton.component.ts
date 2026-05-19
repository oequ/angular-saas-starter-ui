import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

@Component({
  selector: 'oequ-integrations-page-skeleton',
  imports: [HlmSkeletonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      @for (_ of cardSlots; track $index) {
        <div class="border-border flex flex-col gap-4 rounded-xl border p-5">
          <div class="flex items-start gap-3">
            <hlm-skeleton class="size-11 rounded-lg" />
            <div class="flex-1 space-y-2">
              <hlm-skeleton class="h-5 w-28" />
              <hlm-skeleton class="h-4 w-full" />
              <hlm-skeleton class="h-4 w-4/5" />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <hlm-skeleton class="h-6 w-20 rounded-full" />
            <hlm-skeleton class="h-9 w-24 rounded-md" />
          </div>
        </div>
      }
    </div>
  `,
})
export class IntegrationsPageSkeletonComponent {
  protected readonly cardSlots = [0, 1, 2] as const;
}
