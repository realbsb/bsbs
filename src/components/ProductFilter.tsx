'use client'

import { useState } from 'react'
import type { AutoFilterConfig, ActiveFilters, FilterOption, RangeFilter } from '@/types/data'

interface ProductFilterProps {
    filterConfig: AutoFilterConfig
    onFilterChange: (filters: ActiveFilters) => void
}

export default function ProductFilter({ filterConfig, onFilterChange }: ProductFilterProps) {
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({})

    const handleFilterChange = (key: string, value: string | string[] | RangeFilter | null) => {
        const newFilters = { ...activeFilters }

        if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
            delete newFilters[key]
        } else {
            newFilters[key] = value
        }

        setActiveFilters(newFilters)
        onFilterChange(newFilters)
    }

    const renderFilterInput = (key: string, config: FilterOption) => {
        switch (config.type) {
            case 'select':
                return (
                    <div className="field">
                        <label className="label">{config.title}</label>
                        <div className="control">
                            <div className="select is-fullwidth">
                                <select
                                    value={activeFilters[key] as string || ''}
                                    onChange={(e) => handleFilterChange(key, e.target.value || null)}
                                >
                                    <option value="">Все</option>
                                    {config.values?.map((value: string) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )

            case 'number':
                return (
                    <div className="field">
                        <label className="label">{config.title}</label>
                        <div className="control">
                            <div className="select is-fullwidth">
                                <select
                                    value={activeFilters[key] as string || ''}
                                    onChange={(e) => handleFilterChange(key, e.target.value || null)}
                                >
                                    <option value="">Все</option>
                                    {config.values?.map((value: string) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )

            case 'range':
                const rangeValue = activeFilters[key] as RangeFilter || {}
                return (
                    <div className="field">
                        <label className="label">{config.title}</label>
                        <div className="field is-grouped">
                            <div className="control is-expanded">
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Мин"
                                    value={rangeValue.min || ''}
                                    onChange={(e) => handleFilterChange(key, {
                                        ...rangeValue,
                                        min: e.target.value ? Number(e.target.value) : undefined
                                    })}
                                />
                            </div>
                            <div className="control is-expanded">
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Макс"
                                    value={rangeValue.max || ''}
                                    onChange={(e) => handleFilterChange(key, {
                                        ...rangeValue,
                                        max: e.target.value ? Number(e.target.value) : undefined
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                )

            case 'checkbox':
                const checkboxValues = (activeFilters[key] as string[]) || []
                return (
                    <div className="field">
                        <label className="label">{config.title}</label>
                        <div className="control">
                            {config.values?.map((value: string) => (
                                <label key={value} className="checkbox mr-3">
                                    <input
                                        type="checkbox"
                                        checked={checkboxValues.includes(value)}
                                        onChange={(e) => {
                                            let newValues: string[]

                                            if (e.target.checked) {
                                                newValues = [...checkboxValues, value]
                                            } else {
                                                newValues = checkboxValues.filter(v => v !== value)
                                            }

                                            handleFilterChange(key, newValues.length > 0 ? newValues : null)
                                        }}
                                    />
                                    {value}
                                </label>
                            ))}
                        </div>
                    </div>
                )

            default:
                // Убираем exhaustiveCheck чтобы избежать TypeScript ошибки
                return null
        }
    }

    return (
        <div className="box">
            <h3 className="title is-5">Фильтры</h3>
            {Object.entries(filterConfig).map(([key, config]) => (
                <div key={key}>
                    {renderFilterInput(key, config)}
                </div>
            ))}

            {Object.keys(activeFilters).length > 0 && (
                <div className="field">
                    <button
                        className="button is-light is-fullwidth"
                        onClick={() => {
                            setActiveFilters({})
                            onFilterChange({})
                        }}
                    >
                        Сбросить фильтры
                    </button>
                </div>
            )}
        </div>
    )
}