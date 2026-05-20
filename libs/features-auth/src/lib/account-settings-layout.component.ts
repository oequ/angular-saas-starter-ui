import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@oequ/i18n';

@Component({
  selector: 'oequ-account-settings-layout',
  imports: [RouterOutlet, TranslocoPipe],
  template: `
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">
        {{ 'account.layout.title' | transloco }}
      </h1>
      <div class="mt-6">
        <router-outlet />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsLayoutComponent {}
