import React from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Clock, Scissors, TrendingUp } from "lucide-react";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend
);

const baseOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { position: "top", labels: { font: { family: "Inter, sans-serif", size: 12 }, usePointStyle: true, padding: 16 } },
    tooltip: {
      backgroundColor: "rgba(15,23,42,0.9)",
      titleFont: { family: "Inter, sans-serif", size: 13, weight: "700" },
      bodyFont: { family: "Inter, sans-serif", size: 12 },
      padding: 12, cornerRadius: 10, borderColor: "rgba(108,71,255,0.3)", borderWidth: 1,
    },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { family: "Inter" } } },
    x: { grid: { display: false }, ticks: { font: { family: "Inter" } } },
  },
};

function ChartCard({ icon: Icon, title, color, children }) {
  return (
    <div style={{ background: "white", borderRadius: 20, padding: "1.5rem", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color || "var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={"var(--primary)"} />
        </div>
        <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text)" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export function PeakHoursChart({ data }) {
  const chartData = {
    labels: data.map((d) => `${d.hour}:00`),
    datasets: [{
      label: "Bookings",
      data: data.map((d) => d.booking_count),
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
        gradient.addColorStop(0, "rgba(108, 71, 255, 0.9)");
        gradient.addColorStop(1, "rgba(168, 85, 247, 0.3)");
        return gradient;
      },
      borderColor: "rgba(108, 71, 255, 1)",
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };
  return (
    <ChartCard icon={Clock} title="Peak Hours — Last 30 Days">
      <Bar data={chartData} options={baseOptions} />
    </ChartCard>
  );
}

export function ServicePopularityChart({ data }) {
  const colors = [
    "#6c47ff", "#ec4899", "#f59e0b", "#10b981",
    "#06b6d4", "#e11d48", "#f97316", "#8b5cf6",
  ];
  const chartData = {
    labels: data.map((d) => d.service_name),
    datasets: [{
      label: "Bookings",
      data: data.map((d) => d.booking_count),
      backgroundColor: colors,
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };
  return (
    <ChartCard icon={Scissors} title="Popular Services">
      <Doughnut data={chartData} options={{ ...baseOptions, scales: undefined, cutout: "68%", plugins: { ...baseOptions.plugins, legend: { position: "right", labels: { font: { family: "Inter", size: 11 }, usePointStyle: true, padding: 12 } } } }} />
    </ChartCard>
  );
}

export function DailyBookingsChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [{
      label: "Bookings",
      data: data.map((d) => d.count),
      fill: true,
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, "rgba(108, 71, 255, 0.2)");
        gradient.addColorStop(1, "rgba(108, 71, 255, 0)");
        return gradient;
      },
      borderColor: "rgba(108, 71, 255, 1)",
      borderWidth: 2.5,
      tension: 0.45,
      pointRadius: 5,
      pointBackgroundColor: "white",
      pointBorderColor: "#6c47ff",
      pointBorderWidth: 2,
      pointHoverRadius: 7,
    }],
  };
  return (
    <ChartCard icon={TrendingUp} title="Daily Bookings — Last 7 Days">
      <Line data={chartData} options={baseOptions} />
    </ChartCard>
  );
}
