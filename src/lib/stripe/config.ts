export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    stripePriceId: null,
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
  },
} as const;

export type PlanType = keyof typeof PLANS;
