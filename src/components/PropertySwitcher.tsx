import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export interface SwitchableProperty {
  id: string
  name: string
}

export function PropertySwitcher({
  current,
  properties,
  staffLabel,
  onSelect,
}: {
  current: SwitchableProperty | null
  properties: SwitchableProperty[]
  staffLabel: string
  onSelect: (propertyId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const canSwitch = properties.length > 1

  useEffect(() => {
    if (!open) return
    const currentIndex = Math.max(0, properties.findIndex((property) => property.id === current?.id))
    setActiveIndex(currentIndex)
    requestAnimationFrame(() => optionRefs.current[currentIndex]?.focus())

    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open, current?.id, properties])

  const initials = (current?.name ?? '??').slice(0, 2).toUpperCase()

  function closeAndRestoreFocus() {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault()
      closeAndRestoreFocus()
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      let next = index
      if (event.key === 'ArrowDown') next = (index + 1) % properties.length
      if (event.key === 'ArrowUp') next = (index - 1 + properties.length) % properties.length
      if (event.key === 'Home') next = 0
      if (event.key === 'End') next = properties.length - 1
      setActiveIndex(next)
      optionRefs.current[next]?.focus()
    }
  }

  return (
    <div ref={rootRef} className="property-switcher-root">
      <button
        ref={triggerRef}
        type="button"
        className="property-switcher"
        aria-haspopup={canSwitch ? 'listbox' : undefined}
        aria-expanded={canSwitch ? open : undefined}
        aria-controls={canSwitch ? 'property-switcher-listbox' : undefined}
        onClick={() => canSwitch && setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (!canSwitch) return
          if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault()
            setOpen(true)
          }
          if (open && event.key === 'Escape') {
            event.preventDefault()
            closeAndRestoreFocus()
          }
        }}
      >
        <span className="mk">{initials}</span>
        <span>
          <strong>{current?.name ?? '—'}</strong>
          <small>{staffLabel}</small>
        </span>
        {canSwitch && <ChevronDown size={16} className={open ? 'rotate' : undefined} aria-hidden="true" />}
      </button>
      {canSwitch && open && (
        <div id="property-switcher-listbox" className="switch-panel" role="listbox" aria-label="Strutture">
          <div className="switch-panel-hd">Strutture</div>
          {properties.map((property, index) => (
            <button
              ref={(node) => { optionRefs.current[index] = node }}
              type="button"
              key={property.id}
              role="option"
              tabIndex={activeIndex === index ? 0 : -1}
              aria-selected={property.id === current?.id}
              className={`switch-panel-row${property.id === current?.id ? ' current' : ''}`}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
              onClick={() => {
                onSelect(property.id)
                closeAndRestoreFocus()
              }}
            >
              <span className="mk">{property.name.slice(0, 2).toUpperCase()}</span>
              <span className="n">{property.name}</span>
              {property.id === current?.id && <Check size={15} className="check" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
