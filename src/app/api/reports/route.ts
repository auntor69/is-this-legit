import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkId, reason } = body;

    if (!checkId || !reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "checkId and reason are required" },
        { status: 400 }
      );
    }

    if (reason.trim().length > 1000) {
      return NextResponse.json(
        { error: "Report reason must be under 1000 characters" },
        { status: 400 }
      );
    }

    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : `anon-${randomUUID()}`;

    const recentReport = await prisma.report.findFirst({
      where: {
        checkId,
        ip,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (recentReport) {
      return NextResponse.json(
        { error: "You can only submit one report per hour for this URL" },
        { status: 429 }
      );
    }

    const report = await prisma.report.create({
      data: { checkId, reason: reason.trim(), ip },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
