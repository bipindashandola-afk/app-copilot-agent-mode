import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type TeamItem = { name: string; members?: Array<string | { _id?: string; toString?: () => string }> };

export default function Teams() {
  const [items, setItems] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<{ teams?: TeamItem[] }>('/api/teams')
      .then((payload) => {
        if (active) {
          setItems(payload.teams ?? []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? `Unable to load teams: ${err.message}` : 'Unable to load teams');
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
      title="Teams"
      description="Manage teams and members."
      isLoading={loading}
      error={error}
      emptyText="No teams"
      items={items.map((team) => ({
        label: team.name,
        detail: `${(team.members ?? []).length} member${(team.members ?? []).length === 1 ? '' : 's'}`,
      }))}
    />
  );
}
