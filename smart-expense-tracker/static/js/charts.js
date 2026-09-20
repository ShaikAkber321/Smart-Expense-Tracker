/**
 * Chart.js Visualization Utility
 * Standardizes styling, palettes, tooltips, and gridlines.
 */

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

window.AppCharts = {
  renderMonthlyTrend(canvasId, labels, values) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Expenses (₹)',
          data: values,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#4f46e5',
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: (v) => `₹${(v/1000).toFixed(0)}k`
            }
          },
          x: { grid: { display: false } }
        }
      }
    });
  },

  renderCategoryDonut(canvasId, labels, values) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: PALETTE.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 12, font: { size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}`
            }
          }
        },
        cutout: '70%'
      }
    });
  },

  renderForecastComparison(canvasId, timeline) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !timeline) return null;

    const labels = timeline.map(t => t.label);
    const actuals = timeline.map(t => t.is_predicted ? null : t.amount);
    const preds = timeline.map((t, i) => {
      if (t.is_predicted) return t.amount;
      if (i === timeline.length - 2) return t.amount;
      return null;
    });

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
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
            label: 'Predicted Next Month (₹)',
            data: preds,
            borderColor: '#9333ea',
            borderDash: [6, 4],
            backgroundColor: 'rgba(147, 51, 234, 0.05)',
            borderWidth: 2.5,
            pointRadius: 6,
            pointBackgroundColor: '#9333ea',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } }
        },
        scales: {
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { callback: (v) => `₹${(v/1000).toFixed(0)}k` }
          },
          x: { grid: { display: false } }
        }
      }
    });
  },

  renderPaymentMethods(canvasId, labels, values) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    return new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#64748b'],
          borderWidth: 2,
          borderColor: '#ffffff',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } }
        }
      }
    });
  },

  renderDailySpending(canvasId, labels, values) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Avg Spending (₹)',
          data: values,
          backgroundColor: '#818cf8',
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#f1f5f9' }, beginAtZero: true },
          x: { grid: { display: false } }
        }
      }
    });
  },

  renderBudgetVsActual(canvasId, budget, actual) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Current Month'],
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
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });
  }
};
