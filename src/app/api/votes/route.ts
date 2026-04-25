import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkId, value } = body;

    if (!checkId || (value !== 1 && value !== -1)) {
      return NextResponse.json(
        { error: "checkId and value (1 or -1) are required" },
        { status: 400 }
      );
    }

    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip = forwarded ? forwarded.split(",")[0].trim() : realIp || "unknown";

    const existing = await prisma.vote.findUnique({
      where: { checkId_ip: { checkId, ip } },
    });

    if (existing) {
      if (existing.value === value) {
        return NextResponse.json(
          { error: "You have already voted" },
          { status: 409 }
        );
      }

      const diff = value - existing.value;
      const [, updatedCheck] = await prisma.$transaction([
        prisma.vote.update({
          where: { id: existing.id },
          data: { value },
        }),
        prisma.check.update({
          where: { id: checkId },
          data: { score: { increment: diff } },
        }),
      ]);

      return NextResponse.json({ message: "Vote updated", score: updatedCheck.score });
    }

    const [, updatedCheck] = await prisma.$transaction([
      prisma.vote.create({
        data: { checkId, value, ip },
      }),
      prisma.check.update({
        where: { id: checkId },
        data: { score: { increment: value } },
      }),
    ]);

    return NextResponse.json({ message: "Vote recorded", score: updatedCheck.score }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
