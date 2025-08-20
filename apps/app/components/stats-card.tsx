import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  completed: '#10B981',
  pending: '#F59E0B',
  cancelled: '#EF4444',
  default: '#E5E7EB'
};

type StatsCardProps = {
  title: string;
  data: {
    name: string;
    value: number;
    color: keyof typeof COLORS;
  }[];
  total: number;
};

export function StatsCard({ title, data, total }: StatsCardProps) {
  return (
    <div className="rounded-xl bg-card p-6 shadow h-full flex flex-col">
      <h3 className="font-semibold text-muted-foreground mb-4">{title}</h3>
      <div className="flex-1 flex items-center">
        <div className="w-32 h-32 mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[entry.color] || COLORS.default} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value} cases`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="ml-6 space-y-2">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-sm text-muted-foreground">Total Cases</div>
          <div className="space-y-1 mt-4">
            {data.map((item) => (
              <div key={item.name} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[item.color] || COLORS.default }}
                />
                <span className="text-muted-foreground">{item.name}:</span>
                <span className="font-medium ml-1">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}