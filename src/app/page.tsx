"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }
    if (!category) {
      setError("Please select a category");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), category }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push(`/check/${data.check.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="text-center space-y-3 pt-4">
        <h1 className="text-3xl font-bold tracking-tight">
          🛡️ Is This Legit?
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Check if a website, shop, or page is safe. Paste the link below and
          see what the community says.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm"
      >
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Website or Page URL
          </label>
          <input
            id="url"
            type="text"
            placeholder="e.g. facebook.com/somepage or shop.com.bd"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Select a category...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Checking..." : "Check This Link"}
        </button>
      </form>

      <RecentChecks />
    </div>
  );
}

function RecentChecks() {
  const [checks, setChecks] = useState<
    Array<{
      id: string;
      url: string;
      category: string;
      status: string;
      score: number;
    }>
  >([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/checks")
      .then((r) => r.json())
      .then((data) => {
        setChecks(data.checks || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) return null;
  if (checks.length === 0) return null;

  const statusStyles: Record<string, string> = {
    trusted: "bg-green-100 text-green-700",
    suspicious: "bg-yellow-100 text-yellow-700",
    scam: "bg-red-100 text-red-700",
    pending: "bg-gray-100 text-gray-700",
  };

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Recent Checks</h2>
      <div className="space-y-2">
        {checks.map((check) => (
          <a
            key={check.id}
            href={`/check/${check.id}`}
            className="block bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{check.url}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {check.category} · Score: {check.score}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${statusStyles[check.status] || statusStyles.pending}`}
              >
                {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
