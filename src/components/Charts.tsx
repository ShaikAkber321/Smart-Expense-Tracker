import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const PALETTE = [
  '#4f46e5', // indigo
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#64748b', // slate
  '#84cc16', // lime
];

interface MonthlyTrendProps {
  labels: string[];
  values: number[];
}

export function MonthlyTrendChart({ labels, values }: MonthlyTrendProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Monthly Spending (₹)',
            data: values,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            borderWidth: 2.5,
            tension: 0.35,
            fill: true,
            pointBackgroundColor: '#4f46e5',
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => ` ₹${(item.parsed.y ?? 0).toLocaleString('en-IN')}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: (v) => `₹${(Number(v) / 1000).toFixed(0)}k`,
            },
          },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [labels, values]);

  return <canvas ref={canvasRef} />;
}

interface CategoryChartProps {
  labels: string[];
  values: number[];
}

export function CategoryDonutChart({ labels, values }: CategoryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: PALETTE.slice(0, labels.length),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 12, font: { size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.label}: ₹${(item.parsed ?? 0).toLocaleString('en-IN')}`,
            },
          },
        },
        cutout: '70%',
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [labels, values]);

  return <canvas ref={canvasRef} />;
}

interface ForecastTimelineProps {
  timeline: Array<{ label: string; amount: number; is_predicted?: boolean }>;
}

export function ForecastTimelineChart({ timeline }: ForecastTimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !timeline || timeline.length === 0) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = timeline.map((t) => t.label);
    const actuals = timeline.map((t) => (t.is_predicted ? null : t.amount));
    const preds = timeline.map((t, i) => {
      if (t.is_predicted) return t.amount;
      if (i === timeline.length - 2) return t.amount;
      return null;
    });

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Actual Spending (₹)',
            data: actuals,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.05)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 4,
          },
          {
            label: 'Forecasted Prediction (₹)',
            data: preds,
            borderColor: '#9333ea',
            borderDash: [6, 4],
            backgroundColor: 'rgba(147, 51, 234, 0.05)',
            borderWidth: 2.5,
            pointRadius: 6,
            pointBackgroundColor: '#9333ea',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
        },
        scales: {
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { callback: (v) => `₹${(Number(v) / 1000).toFixed(0)}k` },
          },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [timeline]);

  return <canvas ref={canvasRef} />;
}

interface PaymentMethodProps {
  labels: string[];
  values: number[];
}

export function PaymentMethodChart({ labels, values }: PaymentMethodProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#64748b'],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [labels, values]);

  return <canvas ref={canvasRef} />;
}

interface DailyWeekdayProps {
  labels: string[];
  values: number[];
}

export function DailyWeekdayChart({ labels, values }: DailyWeekdayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Avg Daily Spend (₹)',
            data: values,
            backgroundColor: '#818cf8',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#f1f5f9' }, beginAtZero: true },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [labels, values]);

  return <canvas ref={canvasRef} />;
}

interface BudgetVsActualProps {
  budget: number;
  actual: number;
}

export function BudgetVsActualChart({ budget, actual }: BudgetVsActualProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Current Month Allowance'],
        datasets: [
          {
            label: 'Budget Limit (₹)',
            data: [budget],
            backgroundColor: '#cbd5e1',
            borderRadius: 6,
          },
          {
            label: 'Actual Spent (₹)',
            data: [actual],
            backgroundColor: actual > budget ? '#f43f5e' : '#4f46e5',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [budget, actual]);

  return <canvas ref={canvasRef} />;
}
