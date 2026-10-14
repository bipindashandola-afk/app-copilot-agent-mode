import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title: string; focus?: string; reason?: string; minutes?: number; difficulty?: string };

export default function Workouts() {
  const [items, setItems] = useState<WorkoutSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ suggestions?: WorkoutSuggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`)
      .then((payload) => {
        if (active) {
          setItems(payload.suggestions ?? []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? `Unable to load workout suggestions: ${err.message}` : 'Unable to load workout suggestions');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      isLoading={loading}
      error={error}
      emptyText="No workout suggestions"
      items={items.map((suggestion) => ({
        label: suggestion.title,
        detail: suggestion.reason ?? `${suggestion.focus ?? 'General'} • ${suggestion.minutes ?? 0} min`,
      }))}
    />
  );
}
