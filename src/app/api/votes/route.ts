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
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

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

      await prisma.vote.update({
        where: { id: existing.id },
        data: { value },
      });

      const diff = value - existing.value;
      await prisma.check.update({
        where: { id: checkId },
        data: { score: { increment: diff } },
      });

      return NextResponse.json({ message: "Vote updated" });
    }

    await prisma.vote.create({
      data: { checkId, value, ip },
    });

    await prisma.check.update({
      where: { id: checkId },
      data: { score: { increment: value } },
    });

    return NextResponse.json({ message: "Vote recorded" }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
