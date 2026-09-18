import { useState } from 'react'
import { Calendar, Flame, Layers, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { CategoryHeatmapMonth, CategoryHeatmapRow } from '../analytics.types'

export interface CategorySpendingHeatmapProps {
  rows: CategoryHeatmapRow[]
  monthColumns: { key: string; label: string }[]
  currency?: string
  isLoading?: boolean
}

export function CategorySpendingHeatmap({
  rows,
  monthColumns,
  currency = 'BDT',
  isLoading = false,
}: CategorySpendingHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    categoryName: string
    cell: CategoryHeatmapMonth
  } | null>(null)

  const hasData = rows.length > 0 && rows.some((r) => r.totalAmount > 0)

  // Calculate monthly column totals
  const monthlyTotals: Record<string, number> = {}
  monthColumns.forEach((col) => {
    monthlyTotals[col.key] = rows.reduce((sum, r) => {
      const match = r.months.find((m) => m.monthKey === col.key)
      return sum + (match?.amount ?? 0)
    }, 0)
  })

  const grandTotal = rows.reduce((sum, r) => sum + r.totalAmount, 0)

  return (
    <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                <Flame className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">
                Category Spending Heatmap Matrix
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              Intensity matrix tracking peak category spending across months
            </CardDescription>
          </div>

          {/* Heat Legend */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground self-start sm:self-auto">
            <span>Low</span>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-xs bg-muted/30 border border-border/50" />
              <span className="h-3 w-3 rounded-xs bg-indigo-500/20" />
              <span className="h-3 w-3 rounded-xs bg-indigo-500/40" />
              <span className="h-3 w-3 rounded-xs bg-indigo-500/70" />
              <span className="h-3 w-3 rounded-xs bg-indigo-600 shadow-xs" />
            </div>
            <span>Peak</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="h-64 w-full animate-pulse rounded-xl bg-muted/40" />
        ) : !hasData ? (
          <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/80 p-6 text-center">
            <Layers className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No category expense patterns</p>
            <p className="text-xs text-muted-foreground/80 mt-1 max-w-xs">
              Log category-tagged transactions to generate multi-month heatmap distributions.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Heatmap Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-2.5 px-3 min-w-[160px]">Category</th>
                    {monthColumns.map((col) => (
                      <th key={col.key} className="py-2.5 px-2 text-center min-w-[70px]">
                        {col.label}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-right min-w-[100px]">Total</th>
                    <th className="py-2.5 px-3 text-left min-w-[120px]">Peak Month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {rows.map((row) => (
                    <tr key={row.categoryId} className="hover:bg-muted/20 transition-colors">
                      {/* Category Identity */}
                      <td className="py-2.5 px-3 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: row.color }}
                          />
                          <span className="truncate max-w-[150px]">{row.categoryName}</span>
                        </div>
                      </td>

                      {/* Month Heat Cells */}
                      {row.months.map((cell) => {
                        const isHovered =
                          hoveredCell?.categoryName === row.categoryName &&
                          hoveredCell?.cell.monthKey === cell.monthKey

                        return (
                          <td
                            key={cell.monthKey}
                            className="p-1 text-center"
                            onMouseEnter={() =>
                              setHoveredCell({ categoryName: row.categoryName, cell })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <div
                              className={`relative h-9 rounded-md flex items-center justify-center transition-all cursor-pointer select-none text-[11px] ${getCellClasses(
                                cell.intensity,
                              )} ${isHovered ? 'ring-2 ring-primary ring-offset-1 z-10 scale-105' : ''}`}
                            >
                              {cell.amount > 0 ? (
                                <span>
                                  {cell.amount >= 1000
                                    ? `${(cell.amount / 1000).toFixed(1)}k`
                                    : Math.round(cell.amount)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/30 font-light">-</span>
                              )}
                            </div>
                          </td>
                        )
                      })}

                      {/* Row Total */}
                      <td className="py-2.5 px-3 text-right font-bold text-foreground">
                        {currency}{' '}
                        {row.totalAmount.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </td>

                      {/* Peak Month Badge */}
                      <td className="py-2.5 px-3">
                        {row.peakAmount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                            <Sparkles className="h-3 w-3" />
                            <span>
                              {row.peakMonth} ({currency} {row.peakAmount.toLocaleString()})
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Footer Totals Row */}
                <tfoot>
                  <tr className="border-t-2 border-border/80 bg-muted/50 font-bold text-foreground">
                    <td className="py-2.5 px-3">Total Monthly Spend</td>
                    {monthColumns.map((col) => {
                      const total = monthlyTotals[col.key] ?? 0
                      return (
                        <td key={col.key} className="py-2.5 px-2 text-center text-[11px]">
                          {total > 0
                            ? `${currency} ${
                                total >= 1000 ? `${(total / 1000).toFixed(1)}k` : Math.round(total)
                              }`
                            : '-'}
                        </td>
                      )
                    })}
                    <td className="py-2.5 px-3 text-right text-primary font-extrabold">
                      {currency}{' '}
                      {grandTotal.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-muted-foreground font-medium">
                      All Active Categories
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Active Cell Inspect Popover */}
            {hoveredCell && hoveredCell.cell.amount > 0 ? (
              <div className="flex items-center justify-between rounded-xl bg-card border border-border/80 px-4 py-2 text-xs shadow-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold text-foreground">
                    {hoveredCell.categoryName} — {hoveredCell.cell.label}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    Transactions:{' '}
                    <strong className="text-foreground">{hoveredCell.cell.count}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Amount:{' '}
                    <strong className="text-primary font-bold">
                      {currency} {hoveredCell.cell.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </strong>
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getCellClasses(intensity: number): string {
  switch (intensity) {
    case 1:
      return 'bg-indigo-500/15 text-indigo-400 font-medium'
    case 2:
      return 'bg-indigo-500/35 text-indigo-200 font-semibold'
    case 3:
      return 'bg-indigo-500/60 text-white font-bold'
    case 4:
      return 'bg-indigo-600 text-white font-extrabold shadow-sm ring-1 ring-indigo-400/40'
    default:
      return 'bg-muted/15 text-muted-foreground/40 hover:bg-muted/30'
  }
}
