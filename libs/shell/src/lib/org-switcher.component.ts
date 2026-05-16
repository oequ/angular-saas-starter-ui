import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronsUpDown } from '@ng-icons/lucide';
import { ORG_PORT } from '@oequ/ports';
import { provideBrnPopoverConfig } from '@spartan-ng/brain/popover';
import { HlmSelectImports } from '@spartan-ng/helm/select';

@Component({
  selector: 'oequ-org-switcher',
  imports: [HlmSelectImports, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({ lucideChevronsUpDown }),
    provideBrnPopoverConfig({ align: 'start', sideOffset: 4, offsetX: 0 }),
  ],
  template: `
    <hlm-select
      class="block w-full"
      align="start"
      [sideOffset]="4"
      [offsetX]="0"
      [value]="selectedSlug()"
      [disabled]="organizations().length === 0"
      (valueChange)="onValueChange($event)"
    >
      <hlm-select-trigger
        aria-label="Switch organization"
        class="text-gray-900 !h-9 w-full !justify-start !gap-0 !rounded-md !border-0 !bg-transparent !p-0 !shadow-none hover:!bg-gray-100 focus-visible:!ring-2 [&>ng-icon]:hidden"
      >
        <span
          class="flex h-9 w-full min-w-0 items-center gap-2 px-2 text-left"
        >
          <span
            class="bg-muted text-foreground grid size-7 shrink-0 place-content-center rounded-md text-xs font-semibold"
            aria-hidden="true"
          >
            {{ orgInitial(activeOrganization()?.name) }}
          </span>
          <span class="min-w-0 flex-1 truncate text-sm font-medium leading-none">
            {{ activeOrganization()?.name ?? 'Organization' }}
          </span>
          <ng-icon
            name="lucideChevronsUpDown"
            class="text-muted-foreground size-4 shrink-0"
            aria-hidden="true"
          />
        </span>
      </hlm-select-trigger>

      <hlm-select-content
        *hlmSelectPortal
        class="!min-w-0 !w-[var(--brn-select-width)] !max-w-[var(--brn-select-width)] p-1"
      >
        <p class="text-muted-foreground px-2 py-1.5 text-xs font-medium">
          Your Organizations ({{ organizations().length }})
        </p>
        @for (org of organizations(); track org.id) {
          <hlm-select-item [value]="org.slug" class="gap-2">
            <span
              class="bg-muted text-foreground grid size-6 shrink-0 place-content-center rounded-md text-[11px] font-semibold"
              aria-hidden="true"
            >
              {{ orgInitial(org.name) }}
            </span>
            <span class="min-w-0 truncate">{{ org.name }}</span>
          </hlm-select-item>
        }
      </hlm-select-content>
    </hlm-select>
  `,
})
export class OrgSwitcherComponent {
  private readonly orgPort = inject(ORG_PORT);

  protected readonly organizations = toSignal(this.orgPort.organizations$, {
    initialValue: [],
  });

  protected readonly activeOrganization = toSignal(
    this.orgPort.activeOrganization$,
    { initialValue: null },
  );

  protected readonly selectedSlug = computed(
    () => this.activeOrganization()?.slug ?? null,
  );

  protected orgInitial(name: string | null | undefined): string {
    const trimmed = name?.trim() ?? '';
    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
  }

  protected onValueChange(slug: string | null): void {
    if (!slug || slug === this.selectedSlug()) {
      return;
    }
    void this.orgPort.selectOrganization(slug);
  }
}
