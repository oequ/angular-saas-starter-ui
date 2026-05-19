import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import type { IntegrationCatalogItem } from '@oequ/ports';

import { resolvePublicAssetUrl } from './resolve-public-asset-url';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'oequ-integration-card',
  imports: [HlmButtonImports, HlmCardImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article hlmCard variant="outline" class="flex h-full flex-col gap-4 !p-5">
      <div class="flex items-start gap-3">
        <div
          class="border-border bg-background grid size-11 shrink-0 place-content-center rounded-lg border p-2"
        >
          @if (item().id === 'vercel') {
            <img
              [src]="logoSrc('integrations/vercel.svg')"
              [alt]=""
              class="size-full object-contain dark:hidden"
              width="28"
              height="28"
            />
            <img
              [src]="logoSrc('integrations/vercel-dark.svg')"
              [alt]=""
              class="hidden size-full object-contain dark:block"
              width="28"
              height="28"
            />
          } @else {
            <img
              [src]="logoSrc(item().logoUrl)"
              [alt]=""
              class="size-full object-contain"
              width="28"
              height="28"
            />
          }
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-base font-semibold leading-tight">{{ item().name }}</h2>
          <p class="text-muted-foreground mt-1 text-sm leading-relaxed">
            {{ item().description }}
          </p>
        </div>
      </div>

      <div class="mt-auto flex items-center justify-between gap-3">
        @if (connected()) {
          <span
            class="border-emerald-500/25 bg-emerald-500/10 text-emerald-700 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium dark:text-emerald-400"
          >
            Connected
          </span>
          <button
            hlmBtn
            type="button"
            variant="outline"
            size="sm"
            (click)="disconnectClicked.emit()"
          >
            Disconnect
          </button>
        } @else {
          <span class="text-muted-foreground text-xs">Not connected</span>
          <button hlmBtn type="button" size="sm" (click)="connectClicked.emit()">
            Connect
          </button>
        }
      </div>
    </article>
  `,
})
export class IntegrationCardComponent {
  private readonly document = inject(DOCUMENT);

  readonly item = input.required<IntegrationCatalogItem>();
  readonly connected = input(false);

  readonly connectClicked = output<void>();
  readonly disconnectClicked = output<void>();

  protected logoSrc(assetPath: string): string {
    return resolvePublicAssetUrl(this.document, assetPath);
  }
}
