"use client";
import { useEffect, useState } from "react";

type M = { id: string; name: string; cardId: string; currentStreak: number; maxStreak: number; lastScanDay: string | null; frozenUntil: string | null; active: boolean; showOnBoard: boolean };
const api = (url: string, method: string, body?: object) =>
  fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) }).then(async (r) => ({ ok: r.ok, data: await r.json() }));

export default function Admin() {
  const [ms, setMs] = useState<M[]>([]);
  const [name, setName] = useState(""); const [card, setCard] = useState(""); const [sim, setSim] = useState("");
  const [msg, setMsg] = useState("");
  const load = () => fetch("/api/admin/members").then((r) => r.json()).then(setMs);
  useEffect(() => { load(); }, []);

  const add = async () => { const r = await api("/api/admin/members", "POST", { name, cardId: card }); setMsg(r.ok ? "Added" : r.data.error); if (r.ok) { setName(""); setCard(""); load(); } };
  const patch = async (id: string, b: object) => { await api(`/api/admin/members/${id}`, "PATCH", b); load(); };
  const del = async (id: string) => { if (confirm("Delete member and logs?")) { await api(`/api/admin/members/${id}`, "DELETE"); load(); } };
  const tap = async (c = sim) => { const r = await api("/api/admin/simulate", "POST", { cardId: c }); setMsg(JSON.stringify(r.data)); load(); };

  return (
    <div className="adm">
      <h1>STRK ADMIN</h1>
      <div className="panel"><h2>Simulate card tap</h2>
        <div className="f"><input placeholder="Card ID e.g. CARD_001" value={sim} onChange={(e) => setSim(e.target.value)} /><button onClick={() => tap()}>Tap</button></div>
        {msg && <div className="msg">{msg}</div>}
      </div>
      <div className="panel"><h2>Add member</h2>
        <div className="f"><input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /><input placeholder="Card / QR / RFID ID" value={card} onChange={(e) => setCard(e.target.value)} /><button onClick={add}>Add</button></div>
      </div>
      <div className="panel"><h2>Members ({ms.length})</h2>
        <table><thead><tr><th>Name</th><th>Card</th><th>Streak</th><th>Best</th><th>Last</th><th>Freeze until</th><th>Board</th><th></th></tr></thead><tbody>
          {ms.map((m) => (
            <tr key={m.id} style={{ opacity: m.active ? 1 : 0.4 }}>
              <td>{m.name}</td><td>{m.cardId}</td>
              <td><input type="number" defaultValue={m.currentStreak} onBlur={(e) => e.target.value !== String(m.currentStreak) && patch(m.id, { currentStreak: e.target.value })} /></td>
              <td><input type="number" defaultValue={m.maxStreak} onBlur={(e) => e.target.value !== String(m.maxStreak) && patch(m.id, { maxStreak: e.target.value })} /></td>
              <td>{m.lastScanDay ?? "-"}</td>
              <td><input type="date" style={{ width: 140 }} defaultValue={m.frozenUntil ?? ""} onBlur={(e) => e.target.value !== (m.frozenUntil ?? "") && patch(m.id, { frozenUntil: e.target.value })} /></td>
              <td><input type="checkbox" checked={m.showOnBoard} onChange={(e) => patch(m.id, { showOnBoard: e.target.checked })} /></td>
              <td className="f"><button className="g" onClick={() => tap(m.cardId)}>Tap</button><button className="g" onClick={() => patch(m.id, { active: !m.active })}>{m.active ? "Pause" : "Resume"}</button><button className="d" onClick={() => del(m.id)}>Del</button></td>
            </tr>))}
        </tbody></table>
      </div>
    </div>
  );
}