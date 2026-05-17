import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
	selector: 'ul[hlmSidebarMenuSub]',
	host: {
		'data-slot': 'sidebar-menu-sub',
		'data-sidebar': 'menu-sub',
	},
})
export class HlmSidebarMenuSub {
	constructor() {
		classes(() => [
			'ml-[calc(var(--spacing)*7)] flex min-w-0 flex-col gap-1 py-0.5 pr-2',
			'group-data-[collapsible=icon]:hidden',
		]);
	}
}
