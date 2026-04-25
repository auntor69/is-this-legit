import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { STATUS_CONFIG, type Status } from "@/lib/utils";
import VoteButtons from "./vote-buttons";
import ReportForm from "./report-form";

export default async function CheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const check = await prisma.check.findUnique({
    where: { id },
    include: {
      reports: { orderBy: { createdAt: "desc" }, take: 50 },
      _count: { select: { votes: true, reports: true } },
    },
  });

  if (!check) notFound();

  const status = (check.status as Status) || "pending";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold break-all">{check.url}</h1>
            <p className="text-sm text-gray-500 mt-1">{check.category}</p>
          </div>
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap ${config.bg} ${config.color} border ${config.border}`}
          >
            {config.label}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            Score: <strong className="text-gray-900">{check.score}</strong>
          </span>
          <span>
            Votes: <strong className="text-gray-900">{check._count.votes}</strong>
          </span>
          <span>
            Reports:{" "}
            <strong className="text-gray-900">{check._count.reports}</strong>
          </span>
        </div>

        <p className="text-xs text-gray-400">
          Submitted {new Date(check.createdAt).toLocaleDateString("en-BD", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <VoteButtons checkId={check.id} currentScore={check.score} />

      <ReportForm checkId={check.id} />

      {check.reports.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Reports</h2>
          <div className="space-y-2">
            {check.reports.map((report) => (
              <div
                key={report.id}
                className="bg-white border border-gray-200 rounded-lg p-3"
              >
                <p className="text-sm text-gray-800">{report.reason}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(report.createdAt).toLocaleDateString("en-BD", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
