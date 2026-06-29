import React, { useState, useMemo, useCallback } from 'react'

export interface TableColumn<T> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  filterable?: boolean
  filterOptions?: { label: string; value: string }[]
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  keyExtractor: (row: T, index: number) => string | number
  loading?: boolean
  emptyMessage?: string
  pageSize?: number
  rowClassName?: (row: T, index: number) => string
  onRowClick?: (row: T, index: number) => void
  striped?: boolean
  hoverable?: boolean
  selectable?: boolean
  selectedRows?: Set<string | number>
  onSelectionChange?: (selected: Set<string | number>) => void
}

function Table<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data available',
  pageSize = 10,
  rowClassName,
  onRowClick,
  striped = true,
  hoverable = true,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [page, setPage] = useState(1)

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortKey(key)
        setSortDir('asc')
      }
    },
    [sortKey]
  )

  const handleFilter = useCallback((colKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [colKey]: value }))
    setPage(1)
  }, [])

  const allFiltered = useMemo(() => {
    let result = [...data]
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        result = result.filter((row) => {
          const cell = (row as Record<string, unknown>)[key]
          return String(cell ?? '').toLowerCase().includes(value.toLowerCase())
        })
      }
    }
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey]
        const bVal = (b as Record<string, unknown>)[sortKey]
        if (aVal == null) return 1
        if (bVal == null) return -1
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return result
  }, [data, filters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(allFiltered.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return allFiltered.slice(start, start + pageSize)
  }, [allFiltered, page, pageSize])

  const toggleAll = useCallback(() => {
    if (!onSelectionChange) return
    const allKeys = new Set<string | number>(paginated.map((row, i) => String(keyExtractor(row, i))))
    const allSelected = paginated.every((row, i) => selectedRows.has(String(keyExtractor(row, i))))
    const next = allSelected ? new Set<string | number>() : allKeys
    onSelectionChange(next)
  }, [paginated, selectedRows, keyExtractor, onSelectionChange])

  const toggleRow = useCallback(
    (key: string | number) => {
      if (!onSelectionChange) return
      const next = new Set(selectedRows)
      if (next.has(String(key))) { next.delete(String(key)) } else { next.add(String(key)) }
      onSelectionChange(next)
    },
    [selectedRows, onSelectionChange]
  )

  const renderSortIcon = (colKey: string) => {
    if (sortKey !== colKey) {
      return (
        <svg className="w-3 h-3 text-gray-300 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="w-full overflow-hidden">
      {/* Filters */}
      {columns.some((c) => c.filterable) && (
        <div className="flex flex-wrap gap-3 mb-4">
          {columns
            .filter((c) => c.filterable && c.filterOptions)
            .map((col) => (
              <select
                key={col.key}
                value={filters[col.key] || ''}
                onChange={(e) => handleFilter(col.key, e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white outline-none focus:border-blue-500"
              >
                <option value="">All {col.label}</option>
                {col.filterOptions?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {selectable && <th className="px-4 py-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={paginated.length > 0 && paginated.every((row, i) => selectedRows.has(String(keyExtractor(row, i))))}
                  onChange={toggleAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`
                    px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider
                    ${col.sortable ? 'cursor-pointer hover:text-gray-700 select-none' : ''}
                    ${col.align === 'center' ? 'text-center' : ''}
                    ${col.align === 'right' ? 'text-right' : ''}
                  `}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && renderSortIcon(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => {
                const key = keyExtractor(row, i)
                const rowCls = rowClassName?.(row, i) || ''
                const isSelected = selectedRows.has(String(key))
                return (
                  <tr
                    key={key}
                    className={`
                      transition-colors duration-100
                      ${striped && i % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}
                      ${hoverable ? 'hover:bg-blue-50/50' : ''}
                      ${isSelected ? 'bg-blue-50' : ''}
                      ${onRowClick ? 'cursor-pointer' : ''}
                      ${rowCls}
                    `}
                    onClick={() => onRowClick?.(row, i)}
                  >
                    {selectable && (
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(key)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`
                          px-4 py-3 text-gray-700
                          ${col.align === 'center' ? 'text-center' : ''}
                          ${col.align === 'right' ? 'text-right' : ''}
                        `}
                        style={{ width: col.width }}
                      >
                        {col.render ? col.render((row as Record<string, unknown>)[col.key], row, i) : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <span className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, allFiltered.length)} of {allFiltered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-gray-400">…</span>}
                  <button
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 text-sm rounded-lg ${p === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Table
