export interface ShellNavLink {
  readonly kind: 'link';
  readonly labelKey: string;
  readonly path: string;
  readonly icon: string;
  readonly exact: boolean;
}

export interface ShellNavSubLink {
  readonly labelKey: string;
  readonly path: string;
  readonly exact: boolean;
}

export interface ShellNavGroup {
  readonly kind: 'group';
  readonly labelKey: string;
  readonly icon: string;
  readonly basePath: string;
  readonly children: readonly ShellNavSubLink[];
}

export type ShellNavEntry = ShellNavLink | ShellNavGroup;

/** Always first in the shell; route stays reachable after activation completes. */
export const ONBOARDING_SHELL_NAV_LINK: ShellNavLink = {
  kind: 'link',
  labelKey: 'shell.nav.onboarding',
  path: '/onboarding',
  icon: 'lucideRocket',
  exact: true,
};

export const WORKSPACE_SHELL_NAV: readonly ShellNavLink[] = [
  {
    kind: 'link',
    labelKey: 'shell.nav.metrics',
    path: '/workspace/metrics',
    icon: 'lucideBarChart2',
    exact: true,
  },
  {
    kind: 'link',
    labelKey: 'shell.nav.emails',
    path: '/workspace/emails',
    icon: 'lucideMail',
    exact: true,
  },
  {
    kind: 'link',
    labelKey: 'shell.nav.apiKeys',
    path: '/workspace/api-keys',
    icon: 'lucideKeyRound',
    exact: true,
  },
  {
    kind: 'link',
    labelKey: 'shell.nav.integrations',
    path: '/workspace/integrations',
    icon: 'lucidePuzzle',
    exact: true,
  },
  {
    kind: 'link',
    labelKey: 'shell.nav.general',
    path: '/workspace/settings/general',
    icon: 'lucideSettings',
    exact: true,
  },
  {
    kind: 'link',
    labelKey: 'shell.nav.members',
    path: '/workspace/settings/members',
    icon: 'lucideUsers',
    exact: true,
  },
  {
    kind: 'link',
    labelKey: 'shell.nav.billing',
    path: '/workspace/settings/billing',
    icon: 'lucideCreditCard',
    exact: true,
  },
  {
    kind: 'link',
    labelKey: 'shell.nav.usage',
    path: '/workspace/settings/usage',
    icon: 'lucideGauge',
    exact: true,
  },
];

export const PERSONAL_SHELL_NAV: readonly ShellNavLink[] = [
  {
    kind: 'link',
    labelKey: 'shell.nav.profile',
    path: '/account/profile',
    icon: 'lucideUser',
    exact: true,
  },
  {
    kind: 'link',
    labelKey: 'shell.nav.security',
    path: '/account/security',
    icon: 'lucideShield',
    exact: true,
  },
  {
    kind: 'link',
    labelKey: 'shell.nav.sessions',
    path: '/account/sessions',
    icon: 'lucideMonitor',
    exact: true,
  },
];
