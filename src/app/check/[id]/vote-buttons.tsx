"use client";

import { useState } from "react";

export default function VoteButtons({
  checkId,
  currentScore,
}: {
  checkId: string;
  currentScore: number;
}) {
  const [score, setScore] = useState(currentScore);
  const [voted, setVoted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVote(value: 1 | -1) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId, value }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not record vote");
        return;
      }

      setScore(data.score);
      setVoted(value);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">
        What do you think?
      </h2>
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleVote(1)}
          disabled={loading || voted === 1}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
            voted === 1
              ? "bg-green-600 text-white"
              : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          👍 Looks Legit
        </button>
        <button
          onClick={() => handleVote(-1)}
          disabled={loading || voted === -1}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
            voted === -1
              ? "bg-red-600 text-white"
              : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          👎 Looks Scam
        </button>
      </div>
      <p className="text-center text-sm text-gray-500">
        Community Score: <strong className="text-gray-900">{score}</strong>
      </p>
      {error && (
        <p className="text-red-600 text-xs text-center bg-red-50 px-2 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
}
