import type { ActivationOnboardingConfig } from '@oequ/ports';

export const DEMO_EMAIL_ACTIVATION_CONFIG: ActivationOnboardingConfig = {
  title: 'Welcome to your demo workspace',
  subtitle:
    'Get a feel for our platform by exploring live metrics and simulating team collaboration in a sandbox environment.',
  demoSteps: [
    {
      id: 'metrics-retrospective',
      action: 'metrics-retrospective',
      title: 'Simulate email volume',
      description:
        'Generate simulated email traffic over the last 30 days to see how delivery rates, bounces, and charts update in real time.',
      actionLabel: 'Simulate sends',
    },
    {
      id: 'member-impersonation',
      action: 'member-impersonation',
      title: 'Test team roles',
      description:
        'Switch sessions with other teammates instantly to preview different workspace permissions (Admin vs. Member).',
      actionLabel: 'Switch teammate',
    },
  ],
};
