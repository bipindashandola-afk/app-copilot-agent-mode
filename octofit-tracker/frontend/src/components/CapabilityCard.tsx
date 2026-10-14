import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  isLoading?: boolean;
  error?: string | null;
  emptyText?: string;
  items?: Array<{ label: string; detail?: string }>; 
  children?: ReactNode;
};

export function CapabilityCard({ title, description, isLoading = false, error = null, emptyText, items = [], children }: Props) {
  const content = children ?? (
    <>
      {isLoading ? <p role="status">Loading...</p> : null}
      {!isLoading && error ? <p role="alert">{error}</p> : null}
      {!isLoading && !error && items.length === 0 ? <p>{emptyText ?? 'No results'}</p> : null}
      {!isLoading && !error && items.length > 0 ? (
        <ul className="list-unstyled mb-0">
          {items.map((item) => (
            <li key={item.label}>
              <span>{item.label}</span>
              {item.detail ? <small className="d-block text-muted">{item.detail}</small> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {content}
      </div>
    </section>
  );
}
