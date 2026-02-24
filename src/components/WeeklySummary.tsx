import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useWeeklyData } from '../hooks/useWeeklyData';
import { Flame, Target, TrendingUp } from 'lucide-react';

const CHART_COLORS = {
  calories: '#5BA872',
  protein: '#6B9BD1',
  proteinPie: '#6B9BD1',
  carbsPie: '#E8C547',
  fatPie: '#E8A0B0',
};
const AXIS_STROKE = '#6B7280';
const GRID_STROKE = 'rgba(45,49,66,0.08)';

export function WeeklySummary() {
  const {
    days,
    avgCalories,
    avgProtein,
    avgCarbs,
    avgFat,
    streak,
    totalProtein,
    totalCarbs,
    totalFat,
    avgRestCalories,
    avgRestProtein,
    avgLiftCalories,
    avgLiftProtein,
  } = useWeeklyData();

  const barData = days.map((d) => ({
    day: d.dayLabel,
    calories: d.calories,
    protein: d.protein,
    date: d.date,
  }));

  const totalMacroCal =
    totalProtein * 4 + totalCarbs * 4 + totalFat * 9 || 1;
  const pieData = [
    { name: 'Protein', value: Math.round((totalProtein * 4 / totalMacroCal) * 100), color: CHART_COLORS.proteinPie },
    { name: 'Carbs', value: Math.round((totalCarbs * 4 / totalMacroCal) * 100), color: CHART_COLORS.carbsPie },
    { name: 'Fat', value: Math.round((totalFat * 9 / totalMacroCal) * 100), color: CHART_COLORS.fatPie },
  ].filter((d) => d.value > 0);

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <h1 className="text-xl font-bold text-[var(--color-text)] pt-4 pb-2">
        Summary
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        Past 7 days
      </p>

      {/* Weekly bar chart: calories + protein */}
      <section className="rounded-3xl bg-[var(--color-card)] p-4 mb-4 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
          Daily calories & protein
        </h2>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: AXIS_STROKE, fontSize: 12 }}
                axisLine={{ stroke: GRID_STROKE }}
                tickLine={false}
              />
              <YAxis
                yAxisId="cal"
                tick={{ fill: AXIS_STROKE, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={32}
                tickFormatter={(v) => `${v}`}
              />
              <YAxis
                yAxisId="pro"
                orientation="right"
                tick={{ fill: AXIS_STROKE, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
                tickFormatter={(v) => `${v}g`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                }}
                labelStyle={{ color: 'var(--color-text)' }}
                itemStyle={{ color: 'var(--color-text-muted)' }}
                formatter={(value, name) => [
                  name === 'calories' ? `${Number(value)} cal` : `${Number(value)} g`,
                  name === 'calories' ? 'Calories' : 'Protein',
                ]}
                labelFormatter={(_, payload) => (payload?.[0]?.payload as { date?: string })?.date ?? ''}
              />
              <Bar
                yAxisId="cal"
                dataKey="calories"
                fill={CHART_COLORS.calories}
                radius={[4, 4, 0, 0]}
                name="calories"
              />
              <Bar
                yAxisId="pro"
                dataKey="protein"
                fill={CHART_COLORS.protein}
                radius={[4, 4, 0, 0]}
                name="protein"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 justify-center text-xs">
          <span className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-accent)]" />
            Calories
          </span>
          <span className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-protein)]" />
            Protein
          </span>
        </div>
      </section>

      {/* Streak */}
      <section className="rounded-3xl bg-[var(--color-card)] p-4 mb-4 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">
          Streak
        </h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-soft)] flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-[var(--color-text)]">
              {streak} day{streak !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Hitting targets (cal & protein)
            </p>
          </div>
        </div>
      </section>

      {/* Weekly averages */}
      <section className="rounded-3xl bg-[var(--color-card)] p-4 mb-4 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
          Weekly averages
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-card-soft)] px-3 py-2.5">
            <Flame className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
            <div>
              <p className="text-lg font-semibold text-[var(--color-text)]">{avgCalories}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Cal / day</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-card-soft)] px-3 py-2.5">
            <Target className="w-4 h-4 text-[var(--color-protein)] shrink-0" />
            <div>
              <p className="text-lg font-semibold text-[var(--color-text)]">{avgProtein}g</p>
              <p className="text-xs text-[var(--color-text-muted)]">Protein / day</p>
            </div>
          </div>
          <div className="rounded-2xl bg-[var(--color-card-soft)] px-3 py-2.5">
            <p className="text-lg font-semibold text-[var(--color-text)]">{avgCarbs}g</p>
            <p className="text-xs text-[var(--color-text-muted)]">Carbs / day</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-card-soft)] px-3 py-2.5">
            <p className="text-lg font-semibold text-[var(--color-text)]">{avgFat}g</p>
            <p className="text-xs text-[var(--color-text-muted)]">Fat / day</p>
          </div>
        </div>
      </section>

      {/* Macro breakdown pie */}
      {pieData.length > 0 && (
        <section className="rounded-3xl bg-[var(--color-card)] p-4 mb-4 shadow-[var(--shadow-card)]">
          <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
            Macro split (week)
          </h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={{ stroke: AXIS_STROKE }}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="var(--color-card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-[var(--color-text-muted)] text-xs">{value}</span>}
                  iconType="square"
                  iconSize={10}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Rest vs Lift comparison */}
      <section className="rounded-3xl bg-[var(--color-card)] p-4 mb-4 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-3">
          Rest vs Lift days
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[var(--color-card-soft)] p-3 shadow-[var(--shadow-card)]">
            <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Rest day avg</p>
            <p className="text-lg font-semibold text-[var(--color-text)]">{avgRestCalories} cal</p>
            <p className="text-sm text-[var(--color-protein)]">{avgRestProtein}g protein</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-card-soft)] p-3 shadow-[var(--shadow-card)]">
            <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Lift day avg</p>
            <p className="text-lg font-semibold text-[var(--color-text)]">{avgLiftCalories} cal</p>
            <p className="text-sm text-[var(--color-protein)]">{avgLiftProtein}g protein</p>
          </div>
        </div>
      </section>
    </div>
  );
}
