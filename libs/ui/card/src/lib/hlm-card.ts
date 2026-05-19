import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { type VariantProps, cva } from 'class-variance-authority';

import { HlmCardConfig, injectHlmCardConfig } from './hlm-card.token';

const cardVariants = cva(
	'text-card-foreground gap-6 overflow-hidden text-sm has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl group/card flex flex-col',
	{
		variants: {
			variant: {
				default:
					'ring-foreground/10 bg-card rounded-xl py-6 shadow-xs ring-1 data-[size=sm]:py-4',
				outline:
					'border-border bg-transparent rounded-[5px] border py-0 shadow-none data-[size=sm]:py-0',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export type HlmCardVariants = VariantProps<typeof cardVariants>;

@Directive({
	selector: '[hlmCard],hlm-card',
	host: {
		'data-slot': 'card',
		'[attr.data-size]': 'size()',
		'[attr.data-variant]': 'variant()',
	},
})
export class HlmCard {
	private readonly _defaultConfig = injectHlmCardConfig();
	public readonly size = input<HlmCardConfig['size']>(this._defaultConfig.size);
	public readonly variant = input<HlmCardVariants['variant']>('default');

	constructor() {
		classes(() => cardVariants({ variant: this.variant() }));
	}
}
