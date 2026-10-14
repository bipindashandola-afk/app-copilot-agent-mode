import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardItem = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ leaderboard?: LeaderboardItem[] }>('/api/leaderboard')
      .then((payload) => {
        if (active) {
          setItems(payload.leaderboard ?? []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? `Unable to load leaderboard: ${err.message}` : 'Unable to load leaderboard');
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
      title="Leaderboard"
      description="Compare team point totals."
      isLoading={loading}
      error={error}
      emptyText="No leaderboard"
      items={items.map((entry) => ({
        label: `${entry.teamName}`,
        detail: `#${entry.rank} • ${entry.totalPoints} pts`,
      }))}
    />
  );
}
