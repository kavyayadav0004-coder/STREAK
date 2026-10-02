"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Pusher from "pusher-js";

type Row = { id: string; name: string; currentStreak: number; maxStreak: number };
type Hit = { name: string; streak: number; isRecord: boolean };

export default function Display() {
  const [rows, setRows] = useState<Row[]>([]);
  const [hit, setHit] = useState<Hit | null>(null);
  const [online, setOnline] = useState(false);
  const queue = useRef<Hit[]>([]);
  const busy = useRef(false);
  const key = useRef("");

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/v1/leaderboard?key=${key.current}`, { cache: "no-store" });
      if (r.ok) setRows((await r.json()).rows);
    } catch {}
  }, []);

  const next = useCallback(() => {
    const h = queue.current.shift();
    if (!h) { busy.current = false; setHit(null); load(); return; }
    busy.current = true; setHit(h);
    setTimeout(next, 5000);
  }, [load]);

  useEffect(() => {
    key.current = new URLSearchParams(location.search).get("key") || "";
    load();
    const poll = setInterval(load, 30000);            // safety net if the socket silently dies
   const reload = setInterval(async () => {
    try { const r = await fetch(location.href, { method: "HEAD", cache: "no-store" }); if (r.ok) location.reload(); } catch {}
  }, 6 * 3600 * 1000);
    const p = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      channelAuthorization: { endpoint: "/api/pusher/auth", transport: "ajax", params: { key: key.current } },
    });
    p.connection.bind("state_change", (s: { current: string }) => setOnline(s.current === "connected"));
    const ch = p.subscribe("private-strk-display");
    ch.bind("scan", (d: Hit) => {
      if (queue.current.length < 5) queue.current.push(d);
      if (!busy.current) next();
    });
    ch.bind("refresh", load);
    ch.bind("pusher:subscription_succeeded", load); // catch up after any reconnect
    return () => { clearInterval(poll); clearInterval(reload); p.disconnect(); };
  }, [load, next]);

  return (
    <div className="tv">
      <header>
        <div className="logo">STRK 🔥</div>
        <div className="sub">{process.env.NEXT_PUBLIC_GYM_NAME || "Longest active streaks"}</div>
      </header>
      <div className="board">
        <div className="row head"><span>Rank</span><span>Member</span><span>Streak</span><span>Best</span></div>
        {rows.length === 0 && <div className="empty">Check in to start the board 💪</div>}
        {rows.map((r, i) => (
          <div key={r.id} className={`row ${i < 3 ? "p" + (i + 1) : ""}`}>
            <span className="r">#{i + 1}</span>
            <span className="n">{r.name}</span>
            <span className="s">{r.currentStreak}d 🔥</span>
            <span className="b">{r.maxStreak}d</span>
          </div>
        ))}
      </div>
      {hit && (
        <div className="overlay">
          <div className="card">
            <div className="w">WELCOME BACK</div>
            <div className="nm">{hit.name.toUpperCase()}!</div>
            <div className="st"><span className="fl">🔥</span> {hit.streak}-DAY STREAK! <span className="fl">🔥</span></div>
            {hit.isRecord && <div className="rec">NEW PERSONAL RECORD</div>}
          </div>
        </div>
      )}
      <div className={`dot ${online ? "" : "off"}`} />
    </div>
  );
}
