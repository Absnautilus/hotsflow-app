type PlaceholderPageProps = { title: string }

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="page-stack">
      <section className="page-heading">
        <p className="eyebrow">Hotsflow</p>
        <h1>{title}</h1>
        <p className="page-subtitle">Questa destinazione è già definita nella shell. L'integrazione funzionale arriva nei PR successivi.</p>
      </section>
      <section className="empty-state"><span>Foundation pronta</span></section>
    </div>
  )
}
