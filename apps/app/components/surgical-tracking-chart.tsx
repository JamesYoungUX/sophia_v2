import React from "react";

export function SurgicalTrackingChart() {
  const columns = [
    'Week 4 Preop',
    'Week 3 Preop',
    'Week 2 Preop',
    'Week 1 Preop',
    'Surgery Week',
    'Week 1 Postop',
    'Week 2 Postop',
    'Week 3 Postop',
    'Week 4 Postop',
  ];

  type Cell = { pct: number; count: number } | null;
  const rows: Array<{ label: string; patients: number; cells: Cell[] }> = [
    {
      label: 'Week 4 Preop Start',
      patients: 245,
      cells: [
        { pct: 92.0, count: 225 },
        { pct: 89.0, count: 218 },
        { pct: 87.0, count: 205 },
        { pct: 85.0, count: 203 },
        { pct: 81.0, count: 203 },
        { pct: 81.0, count: 198 },
        { pct: 79.0, count: 194 },
        { pct: 77.0, count: 189 },
        { pct: 75.0, count: 184 },
      ],
    },
    {
      label: 'Week 3 Preop Start',
      patients: 208,
      cells: [
        null,
        { pct: 88.0, count: 205 },
        { pct: 86.0, count: 203 },
        { pct: 84.0, count: 195 },
        { pct: 82.0, count: 185 },
        { pct: 80.0, count: 151 },
        { pct: 78.0, count: 147 },
        { pct: 76.0, count: 145 },
        { pct: 74.0, count: 140 },
      ],
    },
    {
      label: 'Week 2 Preop Start',
      patients: 156,
      cells: [
        null,
        null,
        { pct: 85.0, count: 133 },
        { pct: 83.0, count: 129 },
        { pct: 81.0, count: 126 },
        { pct: 79.0, count: 123 },
        { pct: 77.0, count: 120 },
        { pct: 75.0, count: 117 },
        { pct: 73.0, count: 114 },
      ],
    },
    {
      label: 'Week 1 Preop Start',
      patients: 134,
      cells: [
        null,
        null,
        null,
        { pct: 82.0, count: 110 },
        { pct: 80.0, count: 107 },
        { pct: 78.0, count: 105 },
        { pct: 76.0, count: 102 },
        { pct: 74.0, count: 99 },
        { pct: 72.0, count: 96 },
      ],
    },
    {
      label: 'Surgery Week Start',
      patients: 98,
      cells: [
        null,
        null,
        null,
        null,
        { pct: 79.0, count: 77 },
        { pct: 77.0, count: 75 },
        { pct: 75.0, count: 74 },
        { pct: 73.0, count: 72 },
        { pct: 71.0, count: 70 },
      ],
    },
    {
      label: 'Week 1 Postop Start',
      patients: 87,
      cells: [
        null,
        null,
        null,
        null,
        null,
        { pct: 94.0, count: 82 },
        { pct: 92.0, count: 80 },
        { pct: 89.0, count: 77 },
        { pct: 86.0, count: 75 },
        { pct: 83.0, count: 72 },
      ],
    },
    {
      label: 'Week 2 Postop Start',
      patients: 76,
      cells: [
        null,
        null,
        null,
        null,
        null,
        null,
        { pct: 94.0, count: 71 },
        { pct: 91.0, count: 69 },
        { pct: 88.0, count: 67 },
      ],
    },
    {
      label: 'Week 3 Postop Start',
      patients: 62,
      cells: [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        { pct: 96.0, count: 62 },
        { pct: 93.0, count: 60 },
      ],
    },
  ];

  // Color thresholds per spec:
  // >= 85: dark blue, 80-84.99: medium blue, 78-79.99: light pink, <=77.99: dark pink
  const bgForPct = (pct: number) => {
    if (pct >= 85) return "#1d4ed8"; // dark blue
    if (pct >= 80) return "#3b82f6"; // medium blue
    if (pct >= 78) return "#fbcfe8"; // light pink
    return "#db2777"; // dark pink
  };

  const textColorForPct = (pct: number) => {
    if (pct >= 85) return "#ffffff"; // dark blue -> white text
    if (pct >= 80) return "#ffffff"; // medium blue -> white text
    if (pct >= 78) return "#000000"; // light pink -> black text
    return "#ffffff"; // dark pink -> white text
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-6">Surgical Tracking Chart</h2>
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-10 gap-2 mb-4">
            <div className="text-sm font-medium text-gray-600">Timeline</div>
            {columns.map((col) => (
              <div key={col} className="text-xs font-medium text-gray-600 text-center">
                {col}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {rows.map((row) => (
              <React.Fragment key={row.label}>
                <div className="grid grid-cols-10 gap-2 items-center">
                  <div className="text-sm">
                    <div className="font-medium">{row.label}</div>
                    <div className="text-xs text-gray-500">{row.patients} patients</div>
                  </div>
                  {columns.map((_, i) => {
                    const cell = row.cells[i] ?? null;
                    if (!cell) {
                      return (
                        <div key={`${row.label}-${columns[i]}`} className="rounded-md bg-muted/20 border border-dashed border-muted h-14" />
                      );
                    }
                    return (
                      <div
                        key={`${row.label}-${columns[i]}`}
                        className="rounded-md h-14 flex flex-col items-center justify-center"
                        style={{ background: bgForPct(cell.pct), color: textColorForPct(cell.pct) }}
                      >
                        <div className="text-sm font-semibold">{cell.pct.toFixed(1)}%</div>
                        <div className="text-[11px] leading-3 opacity-90">{cell.count}</div>
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
