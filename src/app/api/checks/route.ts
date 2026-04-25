import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeUrl, isValidUrl } from "@/lib/utils";

export async function POST(request: NextRequest) {
  let normalized = "";
  try {
    const body = await request.json();
    const { url, category } = body;

    if (!url || !category) {
      return NextResponse.json(
        { error: "URL and category are required" },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: "Please enter a valid URL" },
        { status: 400 }
      );
    }

    normalized = normalizeUrl(url);

    const existing = await prisma.check.findUnique({
      where: { url: normalized },
    });

    if (existing) {
      return NextResponse.json({ check: existing, existing: true });
    }

    const check = await prisma.check.create({
      data: { url: normalized, category },
    });

    return NextResponse.json({ check, existing: false }, { status: 201 });
  } catch (error: unknown) {
    if (
      normalized &&
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      const existing = await prisma.check.findUnique({
        where: { url: normalized },
      });
      if (existing) {
        return NextResponse.json({ check: existing, existing: true });
      }
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
      const checks = await prisma.check.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { _count: { select: { reports: true, votes: true } } },
      });
      return NextResponse.json({ checks });
    }

    const normalized = normalizeUrl(q);
    const checks = await prisma.check.findMany({
      where: {
        url: { contains: normalized },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { _count: { select: { reports: true, votes: true } } },
    });

    return NextResponse.json({ checks });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
