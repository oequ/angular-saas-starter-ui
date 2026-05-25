import { describe, expect, it } from 'vitest';

import {
  checkoutBillableSeatCount,
  seatsLimitFromStripeQuantity,
  TEAM_PLAN_MAX_SEATS,
} from './billing.utils';

describe('checkoutBillableSeatCount', () => {
  it('returns 1 for Pro (flat price)', () => {
    expect(checkoutBillableSeatCount('pro', 7)).toBe(1);
  });

  it('bills Team by seats used, min 1', () => {
    expect(checkoutBillableSeatCount('team', 0)).toBe(1);
    expect(checkoutBillableSeatCount('team', 4)).toBe(4);
  });

  it('caps Team quantity at catalog max', () => {
    expect(checkoutBillableSeatCount('team', 99, TEAM_PLAN_MAX_SEATS)).toBe(
      TEAM_PLAN_MAX_SEATS,
    );
  });
});

describe('seatsLimitFromStripeQuantity', () => {
  it('returns null for Pro', () => {
    expect(seatsLimitFromStripeQuantity('pro', 5)).toBeNull();
  });

  it('maps Team subscription quantity to seats_limit', () => {
    expect(seatsLimitFromStripeQuantity('team', 12)).toBe(12);
    expect(seatsLimitFromStripeQuantity('team', 200)).toBe(TEAM_PLAN_MAX_SEATS);
  });
});
