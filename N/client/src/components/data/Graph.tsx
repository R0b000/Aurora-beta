import React, { useMemo } from 'react'

export type ChartType = 'line' | 'bar' | 'area' | 'pie'

export interface DataPoint {
  label: string
  value: number
  color?: string
}

export interface Dataset {
  label: string
  data: number[]
  color: string
}

export interface GraphProps {
  type: ChartType
  labels: string[]
  datasets: Dataset[]
  height?: number
  width?: number | string
  showLegend?: boolean
  showGrid?: boolean
  showValues?: boolean
  smooth?: boolean
  title?: string
  className?: string
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

const pad = (n: number, min: number, max: number, height: number, padding: number) => {
  const range = max - min || 1
  return height - padding - ((n - min) / range) * (height - 2 * padding)
}

const Graph: React.FC<GraphProps> = ({
  type,
  labels,
  datasets,
  height = 300,
  width = '100%',
  showLegend = true,
  showGrid = true,
  showValues = false,
  smooth = true,
  title,
  className = '',
}) => {
  const numericWidth = typeof width === 'number' ? width : 600
  const padding = { top: 30, right: 20, bottom: 50, left: 50 }
  const graphWidth = numericWidth - padding.left - padding.right
  const graphHeight = height - padding.top - padding.bottom

  const allValues = useMemo(
    () => datasets.flatMap((d) => d.data),
    [datasets]
  )
  const min = Math.min(...allValues, 0)
  const max = Math.max(...allValues)
  const tickCount = 5
  const ticks = useMemo(() => {
    const step = (max - min) / (tickCount - 1)
    return Array.from({ length: tickCount }, (_, i) => min + step * i)
  }, [min, max])

  const xStep = labels.length > 1 ? graphWidth / (labels.length - 1) : graphWidth
  const barGroupWidth = graphWidth / labels.length

  if (type === 'pie') {
    const total = datasets[0]?.data.reduce((a, b) => a + b, 0) || 0
    let cumAngle = -Math.PI / 2

    const slices = labels.map((_label, i) => {
      const value = datasets[0].data[i]
      const angle = total > 0 ? (value / total) * Math.PI * 2 : 0
      const color = datasets[0]?.color || COLORS[i % COLORS.length]
      const startAngle = cumAngle
      cumAngle += angle
      const endAngle = cumAngle
      const largeArc = angle > Math.PI ? 1 : 0
      const midAngle = startAngle + angle / 2
      const r = numericWidth / 2 - 40
      const cx = numericWidth / 2
      const cy = height / 2

      if (angle === 0) return null

      const x1 = cx + r * Math.cos(startAngle)
      const y1 = cy + r * Math.sin(startAngle)
      const x2 = cx + r * Math.cos(endAngle)
      const y2 = cy + r * Math.sin(endAngle)

      const innerR = 40
      const ix1 = cx + innerR * Math.cos(endAngle)
      const iy1 = cy + innerR * Math.sin(endAngle)
      const ix2 = cx + innerR * Math.cos(startAngle)
      const iy2 = cy + innerR * Math.sin(startAngle)

      const percent = total > 0 ? Math.round((value / total) * 100) : 0

      return (
        <g key={i}>
          <path
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`}
            fill={color}
            stroke="white"
            strokeWidth="2"
            className="hover:opacity-80 transition-opacity"
          />
          {percent > 5 && (
            <text
              x={cx + (r * 0.65) * Math.cos(midAngle)}
              y={cy + (r * 0.65) * Math.sin(midAngle)}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-white text-xs font-bold"
            >
              {percent}%
            </text>
          )}
        </g>
      )
    }).filter(Boolean) as React.ReactNode[]

    return (
      <div className={className}>
        {title && <h4 className="text-sm font-bold text-gray-700 mb-3">{title}</h4>}
        <svg width={numericWidth} height={height}>{slices}</svg>
        {showLegend && (
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {labels.map((label, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-3 h-3 rounded-full" style={{ background: datasets[0]?.color || COLORS[i] }} />
                {label}
                {showValues && <span className="font-semibold">{datasets[0]?.data[i]}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const generatePath = (data: number[], closed = false, filled = false): string => {
    if (data.length === 0) return ''
    const points = data.map((v, i) => ({
      x: padding.left + i * xStep,
      y: pad(v, min, max, height, padding.top),
    }))
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x + 1} ${points[0].y}`
    }
    let d = `M ${points[0].x} ${points[0].y}`
    if (smooth) {
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(i - 1, 0)]
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = points[Math.min(i + 2, points.length - 1)]
        const cp1x = p1.x + (p2.x - p0.x) / 6
        const cp1y = p1.y + (p2.y - p0.y) / 6
        const cp2x = p2.x - (p3.x - p1.x) / 6
        const cp2y = p2.y - (p3.y - p1.y) / 6
        d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`
      }
    } else {
      for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`
    }
    if (filled || closed) {
      const last = points[points.length - 1]
      const first = points[0]
      d += ` L ${last.x} ${height - padding.bottom} L ${first.x} ${height - padding.bottom} Z`
    }
    return d
  }

  const chartType = type === 'area' ? 'line' : type

  return (
    <div className={className}>
      {title && <h4 className="text-sm font-bold text-gray-700 mb-3">{title}</h4>}
      <svg width={numericWidth} height={height}>
        {/* Grid */}
        {showGrid && (
          <g>
            {ticks.map((tick, i) => {
              const y = pad(tick, min, max, height, padding.top)
              return (
                <g key={i}>
                  <line x1={padding.left} y1={y} x2={numericWidth - padding.right} y2={y} stroke="#E5E7EB" strokeDasharray="4 4" />
                  <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-xs fill-gray-400">
                    {Math.round(tick)}
                  </text>
                </g>
              )
            })}
          </g>
        )}

        {/* X-Axis Labels */}
        {labels.map((label, i) => {
          const x = chartType === 'bar' ? padding.left + barGroupWidth * i + barGroupWidth / 2 : padding.left + i * xStep
          return (
            <text
              key={i}
              x={x}
              y={height - 8}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {label}
            </text>
          )
        })}

        {/* Bar Chart */}
        {chartType === 'bar' &&
          datasets.map((dataset, di) => {
            const barWidth = (barGroupWidth / datasets.length) * 0.7
            return dataset.data.map((val, i) => {
              const barH = ((val - min) / (max - min || 1)) * graphHeight
              const x = padding.left + barGroupWidth * i + (barGroupWidth - barWidth * datasets.length) / 2 + di * barWidth
              const y = height - padding.bottom - barH
              const color = dataset.color || COLORS[di]
              return (
                <rect
                  key={`${di}-${i}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill={color}
                  rx="4"
                  className="hover:opacity-80 transition-opacity"
                >
                  <title>{`${dataset.label}: ${dataset.data[i]}`}</title>
                </rect>
              )
            })
          })}

        {/* Line / Area Chart */}
        {(chartType === 'line' || type === 'area') &&
          datasets.map((dataset, di) => {
            const pathD = generatePath(dataset.data, false, type === 'area')
            const color = dataset.color || COLORS[di]
            return (
              <g key={di}>
                {type === 'area' && (
                  <path d={generatePath(dataset.data, false, true)} fill={color} fillOpacity={0.15} />
                )}
                <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {dataset.data.map((val, i) => (
                  <circle
                    key={i}
                    cx={padding.left + i * xStep}
                    cy={pad(val, min, max, height, padding.top)}
                    r="4"
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:r-6 transition-all"
                  >
                    {showValues && (
                      <title>{`${dataset.label}: ${val}`}</title>
                    )}
                  </circle>
                ))}
              </g>
            )
          })}

        {/* Values on top of bars */}
        {showValues && chartType === 'bar' &&
          datasets.map((dataset, di) => {
            const barWidth = (barGroupWidth / datasets.length) * 0.7
            return dataset.data.map((val, i) => (
              <text
                key={`val-${di}-${i}`}
                x={padding.left + barGroupWidth * i + (barGroupWidth - barWidth * datasets.length) / 2 + di * barWidth + barWidth / 2}
                y={pad(val, min, max, height, padding.top) - 8}
                textAnchor="middle"
                className="text-xs font-bold fill-gray-600"
              >
                {val}
              </text>
            ))
          })}
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {datasets.map((ds, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-3 h-3 rounded-full" style={{ background: ds.color || COLORS[i] }} />
              {ds.label}
              {showValues && (
                <span className="font-bold">{ds.data.reduce((a, b) => a + b, 0)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Graph
