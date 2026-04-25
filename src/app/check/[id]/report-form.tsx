"use client";

import { useState } from "react";

export default function ReportForm({ checkId }: { checkId: string }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!reason.trim()) {
      setError("Please enter a reason");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId, reason: reason.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not submit report");
        return;
      }

      setSuccess(true);
      setReason("");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">
        Report this link
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why do you think this is unsafe? (e.g., They took money but never delivered...)"
          maxLength={1000}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {reason.length}/1000 characters
          </span>
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
      {success && (
        <p className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded">
          Report submitted. Thank you for helping keep others safe!
        </p>
      )}
      {error && (
        <p className="text-red-600 text-xs bg-red-50 px-2 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
}
