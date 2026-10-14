import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type ActivityItem = { type: string; minutes: number; points: number };

export default function Activities() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ activities?: ActivityItem[] }>('/api/activities')
      .then((payload) => {
        if (active) {
          setItems(payload.activities ?? []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? `Unable to load activities: ${err.message}` : 'Unable to load activities');
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
      title="Activities"
      description="Track student activity minutes and points."
      isLoading={loading}
      error={error}
      emptyText="No activities"
      items={items.map((activity) => ({ label: activity.type, detail: `${activity.minutes} min • ${activity.points} pts` }))}
    />
  );
}
