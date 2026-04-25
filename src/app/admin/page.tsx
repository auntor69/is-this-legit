"use client";

import { useState, useCallback } from "react";

type Report = {
  id: string;
  reason: string;
  createdAt: string;
};

type Check = {
  id: string;
  url: string;
  category: string;
  status: string;
  score: number;
  createdAt: string;
  reports: Report[];
  _count: { votes: number; reports: number };
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchChecks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (!res.ok) {
        setError("Unauthorized");
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      setChecks(data.checks);
      setAuthenticated(true);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [password]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    await fetchChecks();
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) await fetchChecks();
    } catch {
      setError("Failed to update");
    }
  }

  async function handleDelete(id: string, type: "check" | "report") {
    if (!confirm(`Delete this ${type}?`)) return;
    try {
      const res = await fetch(
        `/api/admin?id=${id}&type=${type}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${password}` },
        }
      );
      if (res.ok) await fetchChecks();
    } catch {
      setError("Failed to delete");
    }
  }

  if (!authenticated) {
    return (
      <div className="max-w-sm mx-auto mt-16">
        <h1 className="text-xl font-bold mb-4 text-center">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  const statuses = ["trusted", "suspicious", "scam", "pending"];
  const statusColors: Record<string, string> = {
    trusted: "bg-green-100 text-green-700",
    suspicious: "bg-yellow-100 text-yellow-700",
    scam: "bg-red-100 text-red-700",
    pending: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button
          onClick={() => {
            setAuthenticated(false);
            setPassword("");
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Logout
        </button>
      </div>

      <p className="text-sm text-gray-500">
        {checks.length} entries total
      </p>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      <div className="space-y-4">
        {checks.map((check) => (
          <div
            key={check.id}
            className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium break-all">{check.url}</p>
                <p className="text-xs text-gray-500">
                  {check.category} · Score: {check.score} · Votes:{" "}
                  {check._count.votes} · Reports: {check._count.reports}
                </p>
              </div>
              <button
                onClick={() => handleDelete(check.id, "check")}
                className="text-red-500 hover:text-red-700 text-xs font-medium shrink-0"
              >
                Delete
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Status:</span>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(check.id, s)}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                    check.status === s
                      ? statusColors[s]
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {check.reports.length > 0 && (
              <div className="border-t border-gray-100 pt-2 space-y-1">
                <p className="text-xs font-medium text-gray-500">Reports:</p>
                {check.reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-start justify-between gap-2 text-xs bg-gray-50 rounded p-2"
                  >
                    <span className="text-gray-700">{report.reason}</span>
                    <button
                      onClick={() => handleDelete(report.id, "report")}
                      className="text-red-400 hover:text-red-600 shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
