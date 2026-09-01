import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Choice = "boy" | "girl";
type GenderRow = { NickName: string; Gender: "男" | "女" | null };

async function listVotes() {
  const { data, error } = await getSupabaseAdmin()
    .from("GenderTbl")
    .select("NickName, Gender")
    .order("VoteDate", { ascending: false })
    .limit(300)
    .returns<GenderRow[]>();

  if (error) throw error;
  return (data ?? []).map((vote) => ({
    id: vote.NickName,
    voterName: vote.NickName,
    choice: vote.Gender === "男" ? ("boy" as const) : ("girl" as const),
  }));
}

export async function GET() {
  try {
    return NextResponse.json(
      { votes: await listVotes() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Failed to read votes", error);
    return NextResponse.json({ error: "目前無法讀取投票資料" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 2048) {
      return NextResponse.json({ error: "資料內容過大" }, { status: 413 });
    }

    const body = (await request.json()) as {
      voterName?: string;
      choice?: Choice;
    };
    const voterName = body.voterName?.trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 16) ?? "";
    const choice = body.choice;
    if (!voterName || !choice || !["boy", "girl"].includes(choice)) {
      return NextResponse.json({ error: "投票資料格式不正確" }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin().from("GenderTbl").upsert(
      {
        NickName: voterName,
        Gender: choice === "boy" ? "男" : "女",
        VoteDate: new Date().toISOString(),
      },
      { onConflict: "NickName" },
    );

    if (error) throw error;
    return NextResponse.json({ votes: await listVotes() }, { status: 201 });
  } catch (error) {
    console.error("Failed to save vote", error);
    return NextResponse.json({ error: "投票沒有成功送出" }, { status: 500 });
  }
}
