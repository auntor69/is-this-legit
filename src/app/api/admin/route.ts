import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { timingSafeEqual } from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function checkAuth(request: NextRequest): boolean {
  if (!ADMIN_PASSWORD) return false;
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;
  const password = authHeader.replace("Bearer ", "");
  if (password.length !== ADMIN_PASSWORD.length) return false;
  return timingSafeEqual(Buffer.from(password), Buffer.from(ADMIN_PASSWORD));
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks = await prisma.check.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reports: { orderBy: { createdAt: "desc" } },
      _count: { select: { votes: true, reports: true } },
    },
  });

  return NextResponse.json({ checks });
}

export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["trusted", "suspicious", "scam", "pending"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const check = await prisma.check.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ check });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "check";

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    if (type === "report") {
      await prisma.report.delete({ where: { id } });
      return NextResponse.json({ message: "Report deleted" });
    }

    await prisma.check.delete({ where: { id } });
    return NextResponse.json({ message: "Entry deleted" });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
