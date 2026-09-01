"use client";

import { useEffect, useMemo, useState } from "react";

type Choice = "boy" | "girl";
type Vote = { id: string; voterName: string; choice: Choice };

export default function Home() {
  const [name, setName] = useState("");
  const [votes, setVotes] = useState<Vote[]>([]);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [screen, setScreen] = useState<"vote" | "result">("vote");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadVotes() {
    try {
      const response = await fetch("/api/votes", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as { votes: Vote[] };
      setVotes(data.votes);
    } catch { setError("目前無法讀取票數，請稍後再試。"); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadVotes(); }, []);

  async function vote(nextChoice: Choice) {
    const voterName = name.trim();
    if (!voterName) {
      setError("請先輸入你的暱稱，再投下神聖的一票～");
      document.getElementById("voter-name")?.focus();
      return;
    }
    setError(""); setSubmitting(true);
    try {
      const response = await fetch("/api/votes", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ voterName, choice: nextChoice }),
      });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as { votes: Vote[] };
      setVotes(data.votes); setChoice(nextChoice); setScreen("result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch { setError("投票沒有送出，請檢查網路後再試一次。"); }
    finally { setSubmitting(false); }
  }

  const stats = useMemo(() => {
    const boy = votes.filter((item) => item.choice === "boy");
    const girl = votes.filter((item) => item.choice === "girl");
    const total = votes.length;
    return { boy, girl, total, boyPct: total ? Math.round(boy.length / total * 100) : 0, girlPct: total ? Math.round(girl.length / total * 100) : 0 };
  }, [votes]);

  return <main className="app-shell">
    <div className="top-wave" aria-hidden="true" />
    <section className="phone-card">
      <header className="brand">
        <span className="sparkle">✦</span><p>果果小夥伴</p>
        <h1>{screen === "vote" ? "即將揭曉" : "大家的猜測"}</h1>
        <p className="subtitle">你覺得是男寶寶，還是女寶寶呢？</p>
      </header>
      {screen === "vote" ? <div className="vote-panel">
        <label htmlFor="voter-name">你的暱稱</label>
        <input id="voter-name" value={name} maxLength={16} onChange={(e) => setName(e.target.value)} placeholder="例如：果果阿姨" autoComplete="nickname" />
        <p className="question">選一個你心中的答案</p>
        <div className="choices" aria-label="選擇寶寶性別">
          <button className="choice girl" onClick={() => void vote("girl")} disabled={submitting} aria-label="猜女寶寶"><span className="baby-photo" aria-hidden="true" /><strong>女寶寶</strong><small>GIRL</small></button>
          <button className="choice boy" onClick={() => void vote("boy")} disabled={submitting} aria-label="猜男寶寶"><span className="baby-photo" aria-hidden="true" /><strong>男寶寶</strong><small>BOY</small></button>
        </div>
        <p className="privacy">每個暱稱計一票；重新投票會更新原本的選擇</p>
      </div> : <div className="result-panel" aria-live="polite">
        <div className={`picked ${choice}`}><span>{choice === "boy" ? "🩵" : "🩷"}</span>你猜的是<strong>{choice === "boy" ? "男寶寶" : "女寶寶"}</strong></div>
        <p className="total">目前共有 <strong>{stats.total}</strong> 位小夥伴參加</p>
        <div className="bar" aria-label={`男寶寶 ${stats.boyPct}%，女寶寶 ${stats.girlPct}%`}><span className="bar-boy" style={{ width: `${stats.boyPct}%` }} /><span className="bar-girl" style={{ width: `${stats.girlPct}%` }} /></div>
        <div className="stat-headings"><div><strong>{stats.boyPct}%</strong><span>男寶寶・{stats.boy.length} 票</span></div><div><strong>{stats.girlPct}%</strong><span>女寶寶・{stats.girl.length} 票</span></div></div>
        <div className="voter-lists"><div><h2>🩵 男寶隊</h2><p>{stats.boy.map(v => v.voterName).join("、") || "等待第一位支持者"}</p></div><div><h2>🩷 女寶隊</h2><p>{stats.girl.map(v => v.voterName).join("、") || "等待第一位支持者"}</p></div></div>
        <button className="retry" onClick={() => { setScreen("vote"); setError(""); }}>重新投票</button>
      </div>}
      {error && <p className="error" role="alert">{error}</p>}
      {loading && <p className="loading">正在數大家的票…</p>}
    </section>
    <div className="bottom-wave" aria-hidden="true" />
  </main>;
}
