import { useEffect, useState } from 'react'
import { ArrowDown, X } from 'lucide-react'
import { getCollectionSubcategories, getSubcategory, getSweetCollection, getSweetType, sweetCollections } from '../data/subcategories'
import '../styles/subcategories.css'

function CollectionChevron() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

export default function SubcategoryFilters({ collection, mithai = '', subcategory = '', sweetType = '', onChange, resultsCount, onViewResults, idPrefix = 'shop' }) {
  const selectedCollection = collection === 'sweets' ? getSweetCollection(mithai) : null
  const choices = getCollectionSubcategories(collection, selectedCollection?.id)
  const selected = getSubcategory(collection, subcategory, selectedCollection?.id)
  const selectedType = getSweetType(collection, selected, sweetType, selectedCollection?.id)
  const [openCollection, setOpenCollection] = useState(selectedCollection?.id || '')

  // A new collection opens its choices. Closing a panel keeps the customer's filters.
  useEffect(() => {
    setOpenCollection(selectedCollection?.id || '')
  }, [selectedCollection?.id])

  function closeCategories() {
    setOpenCollection('')
    requestAnimationFrame(() => {
      const button = document.getElementById(`${idPrefix}-mithai-${selectedCollection?.id}`)
      button?.focus({ preventScroll: true })
      button?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    })
  }

  function chooseCollection(option) {
    if (selectedCollection?.id === option.id) {
      setOpenCollection(current => current === option.id ? '' : option.id)
    } else {
      setOpenCollection(option.id)
      onChange('mithai', option.id)
    }
  }

  function viewResults() {
    setOpenCollection('')
    requestAnimationFrame(() => onViewResults?.())
  }

  if (collection === 'sweets') {
    return <div className="sweet-collection-browser">
      <div className="sweet-collection-browser-heading">
        <p><span className="subcategory-step" aria-hidden="true">1</span>Choose a collection</p>
        <button type="button" className="sweet-collection-reset" aria-pressed={!selectedCollection} onClick={() => { setOpenCollection(''); onChange('mithai', '') }}>All sweets</button>
      </div>
      {selectedCollection && <div className="sweet-selection-summary" role="status" aria-live="polite"><span>Showing</span><ol aria-label="Selected sweet filters">{[selectedCollection.name.replace(/ Collection$/, ''), selected?.name, selectedType?.name].filter(Boolean).map((name, index) => <li key={`${index}-${name}`}>{name}</li>)}</ol></div>}
      <div className="sweet-collection-grid" role="group" aria-label="Sweet collections">
        {sweetCollections.map(option => {
          const active = selectedCollection?.id === option.id
          const expanded = active && openCollection === option.id
          const buttonId = `${idPrefix}-mithai-${option.id}`
          const panelId = `${idPrefix}-sweet-categories-${option.id}`
          return <div className="sweet-collection-item" key={option.id}>
            <button id={buttonId} type="button" className={`sweet-collection-choice${active ? ' is-selected' : ''}`} aria-expanded={expanded} aria-pressed={active} aria-controls={panelId} aria-labelledby={`${buttonId}-name`} aria-describedby={`${buttonId}-description`} onClick={() => chooseCollection(option)}>
              <span className="sweet-collection-choice-name" id={`${buttonId}-name`}>{option.name}</span>
              <span className="sweet-collection-choice-description" id={`${buttonId}-description`}>{option.description}</span>
              <span className="sweet-collection-choice-chevron"><CollectionChevron /></span>
            </button>
            <div id={panelId} className="sweet-category-panel" role="region" aria-label={`${option.name} categories`} hidden={!expanded} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeCategories() } }}>
              {active && <>
                <div className="sweet-category-panel-heading"><p>{option.description}</p><button type="button" className="sweet-category-close" aria-label="Close sweet categories" title="Hide categories and keep your selection" onClick={closeCategories}>Close<X size={15} aria-hidden="true" /></button></div>
                <fieldset className="subcategory-fieldset">
                  <legend className="subcategory-legend"><span className="subcategory-step" aria-hidden="true">2</span>Sweet category</legend>
                  <div className="subcategory-options subcategory-options--categories">
                    <button id={`${idPrefix}-subcategory`} type="button" className="subcategory-option" aria-pressed={!selected} onClick={() => onChange('subcategory', '')}>All categories</button>
                    {choices.map(category => <button id={`${idPrefix}-subcategory-${category.id}`} key={category.id} type="button" className="subcategory-option" aria-pressed={selected?.id === category.id} onClick={() => onChange('subcategory', selected?.id === category.id ? '' : category.id)}>{category.name}</button>)}
                  </div>
                </fieldset>
                {!!selected?.types?.length && <fieldset className="subcategory-fieldset">
                  <legend className="subcategory-legend"><span className="subcategory-step" aria-hidden="true">3</span>{selected.typeLabel || `${selected.name} type`}</legend>
                  <div className="subcategory-options subcategory-options--types">
                    <button id={`${idPrefix}-type`} type="button" className="subcategory-option" aria-pressed={!selectedType} onClick={() => onChange('type', '')}>{selected.allTypesLabel || `All ${selected.name.toLowerCase()} types`}</button>
                    {selected.types.map(type => <button id={`${idPrefix}-type-${type.id}`} key={type.id} type="button" className="subcategory-option" aria-pressed={selectedType?.id === type.id} onClick={() => onChange('type', selectedType?.id === type.id ? '' : type.id)}>{type.name}</button>)}
                  </div>
                </fieldset>}
                {onViewResults && <div className="sweet-category-results"><button type="button" className="sweet-category-results-button" onClick={viewResults}>Show {resultsCount} {resultsCount === 1 ? 'sweet' : 'sweets'}<ArrowDown size={16} aria-hidden="true" /></button></div>}
              </>}
            </div>
          </div>
        })}
      </div>
    </div>
  }

  if (!choices.length) return null
  return <div className="subcategory-browser subcategory-browser--chocolates">
    <fieldset className="subcategory-fieldset">
      <legend className="subcategory-legend">Chocolate type</legend>
      <div className="subcategory-options subcategory-options--categories">
        <button id={`${idPrefix}-subcategory`} type="button" className="subcategory-option" aria-pressed={!selected} onClick={() => onChange('subcategory', '')}>All chocolates</button>
        {choices.map(option => <button id={`${idPrefix}-subcategory-${option.id}`} key={option.id} type="button" className="subcategory-option" aria-pressed={selected?.id === option.id} onClick={() => onChange('subcategory', selected?.id === option.id ? '' : option.id)}>{option.name}</button>)}
      </div>
    </fieldset>
  </div>
}
