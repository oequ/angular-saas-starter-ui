import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'oequ-workspace-settings-layout',
  imports: [RouterOutlet],
  template: `
    <div>
      @if (showWorkspaceSettingsHeading()) {
        <h1 class="text-2xl font-semibold tracking-tight">Workspace settings</h1>
      }
      <div [class.mt-6]="showWorkspaceSettingsHeading()">
        <router-outlet />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceSettingsLayoutComponent {
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly showWorkspaceSettingsHeading = computed(() => {
    const url = this.currentUrl() ?? '';
    if (url.startsWith('/workspace/settings/billing')) {
      return false;
    }
    if (url.startsWith('/workspace/settings/members')) {
      return false;
    }
    return true;
  });
}
