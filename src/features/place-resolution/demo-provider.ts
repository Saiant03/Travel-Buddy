import type { PlaceResolutionProvider } from './contracts';

export function demoProvider(scenario: string): PlaceResolutionProvider {
  return {
    resolve: async () => {
      if (scenario === 'invalid_response') return { ok: true, places: [{}] };
      if (scenario === 'unavailable' || scenario === 'timeout' || scenario === 'quota_exhausted') {
        return { ok: false, error: { code: scenario, retryable: false } };
      }

      const count = scenario === 'zero' ? 0 : scenario === 'multiple' ? 2 : 1;
      return {
        ok: true,
        places: Array.from({ length: count }, (_, index) => ({
          id: `demo-${index + 1}`,
          name: `Nimbus ${index + 1}`,
          location: { lat: 0, lng: index },
          sources: [{
            url: `https://source.invalid/${index + 1}`,
            title: `Demo ${index + 1}`,
            checkedAt: '2026-01-01T00:00:00Z',
          }],
          confidence: 'unconfirmed',
          matchReasons: [],
        })),
      };
    },
  };
}
