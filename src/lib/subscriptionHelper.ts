export function getSubscriptionLimits(plan: string) {
  switch (plan) {
    case 'Trial':
      return { agentSeats: 1, apiRequests: 100, imageGenerations: 20 };
    case 'Starter':
      return { agentSeats: 3, apiRequests: Infinity, imageGenerations: Infinity };
    case 'Growth':
      return { agentSeats: 10, apiRequests: Infinity, imageGenerations: Infinity };
    case 'Enterprise':
      return { agentSeats: Infinity, apiRequests: Infinity, imageGenerations: Infinity };
    default:
      return { agentSeats: 1, apiRequests: 100, imageGenerations: 20 };
  }
}

export function calculateUsagePercentage(used: number, limit: number) {
  if (limit === Infinity) return 100;
  return Math.min(100, (used / limit) * 100);
}
