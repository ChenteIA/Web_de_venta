'use client';
import { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/icons';
import CopyButton from '@/components/CopyButton';
import { supabaseBrowser } from '@/lib/supabase/client';
import { BUSINESS } from '@/lib/site';
import { dayShort, limaDay } from '@/lib/time';

type Row = { kind: 'admin' | 'invite'; id: string; label: string | null; created_at: string; expires_at: string | null; used_at: string | null; used_email: string | null; is_self: boolean };

const when = (ts: string) => dayShort(limaDay(new Date(ts)));

// Pestaña Accesos: enlaces de invitación de un solo uso y quién puede entrar al panel.
export default function Access() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<Row[]>([]);
  const [missing, setMissing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [note, setNote] = useState('');
  const [link, setLink] = useState<{ url: string; note: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [confirm, setConfirm] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await sb.rpc('list_access');
    // Si la función no existe, falta volver a ejecutar schema.sql en Supabase.
    setMissing(Boolean(error));
    setRows(error ? [] : ((data as Row[]) || []));
    setLoaded(true);
  }, [sb]);
  useEffect(() => { load(); }, [load]);

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus('');
    const { data, error } = await sb.rpc('create_invite', { p_note: note.trim() || null });
    setBusy(false);
    if (error || typeof data !== 'string') {
      setStatus('No se pudo crear el enlace. Inténtalo otra vez.');
      return;
    }
    setLink({ url: `${window.location.origin}/admin/invitacion?t=${data}`, note: note.trim() });
    setNote('');
    load();
  }

  async function revoke(id: string) {
    setConfirm('');
    const { error } = await sb.rpc('revoke_invite', { p_id: id });
    setStatus(error ? 'No se pudo anular la invitación.' : 'Invitación anulada: ese enlace ya no funciona.');
    if (link && !error) setLink(null);
    load();
  }

  async function removeAdmin(id: string, email: string) {
    setConfirm('');
    const { error } = await sb.rpc('remove_admin', { p_user: id });
    setStatus(error ? 'No se pudo quitar el acceso.' : `${email} ya no puede entrar al panel.`);
    load();
  }

  const admins = rows.filter((r) => r.kind === 'admin');
  const invites = rows.filter((r) => r.kind === 'invite');
  const now = Date.now();
  const stateOf = (r: Row) => (r.used_at ? 'usada' : r.expires_at && Date.parse(r.expires_at) < now ? 'vencida' : 'pendiente');
  const waText = link ? `Hola${link.note ? ' ' + link.note : ''}, te invito a administrar la web de ${BUSINESS.name}. Crea tu usuario en este enlace (sirve una sola vez y vence en 7 días): ${link.url}` : '';

  if (missing) {
    return (
      <div className="card">
        <div className="notice">Para invitar personas, vuelve a ejecutar <b>supabase/schema.sql</b> en el SQL Editor de Supabase (agrega las invitaciones). No borra tus datos.</div>
      </div>
    );
  }

  return (
    <div className="grid2">
      <div className="card">
        <div className="card-head"><div><h2>Invitar a alguien</h2><p className="sub">Crea un enlace para que otra persona cree su usuario y entre al panel con los mismos permisos que tú. Sirve una sola vez y vence en 7 días.</p></div></div>
        <form className="f" onSubmit={createLink} autoComplete="off">
          <label className="field wide">¿Para quién es? <span className="hint">(opcional, solo para que lo reconozcas)</span>
            <input id="inv-note" value={note} maxLength={60} placeholder="Ej.: Luis, el dueño" autoCapitalize="words" enterKeyHint="done" onChange={(e) => setNote(e.target.value)} />
          </label>
          <div className="field wide" style={{ flexDirection: 'row' }}>
            <button type="submit" className="btn btn-dark btn-sm" disabled={busy}><Icon name="link" />{busy ? 'Creando…' : 'Crear enlace'}</button>
          </div>
        </form>
        {link && (
          <div className="invite-out">
            <p><b>Enlace listo{link.note ? ` para ${link.note}` : ''}.</b> Envíaselo solo a esa persona: quien lo abra primero obtiene el acceso.</p>
            <input id="inv-link" readOnly value={link.url} onFocus={(e) => e.currentTarget.select()} aria-label="Enlace de invitación" />
            <div className="copy-row">
              <CopyButton text={link.url} label="Copiar enlace" />
              <a className="btn btn-wa btn-sm" href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener"><Icon name="whatsapp" />Enviar por WhatsApp</a>
            </div>
          </div>
        )}
        <p className="status" role="status">{status}</p>
      </div>

      <div className="stack">
        <div className="card">
          <div className="card-head"><div><h2>Pueden entrar al panel</h2><p className="sub">Personas con usuario y acceso de administrador.</p></div></div>
          <div className="list">
            {!loaded ? <p className="sub">Cargando…</p> : admins.map((a) => (
              <div className="li" key={a.id}>
                <div>
                  <div className="acc-email">{a.label}{a.is_self && <> <span className="tag">Tú</span></>}</div>
                  <div className="meta">Desde el {when(a.created_at)}</div>
                </div>
                {!a.is_self && (confirm === 'adm:' + a.id ? (
                  <span className="confirm">¿Quitar? <button type="button" className="btn btn-sm btn-danger" onClick={() => removeAdmin(a.id, a.label || '')}>Sí, quitar</button><button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirm('')}>No</button></span>
                ) : (
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirm('adm:' + a.id)}>Quitar acceso</button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><h2>Invitaciones</h2><p className="sub">Los enlaces que creaste y qué pasó con cada uno.</p></div></div>
          <div className="list">
            {loaded && !invites.length && <p className="sub" style={{ padding: '12px 0' }}>Aún no creaste ninguna invitación.</p>}
            {invites.map((r) => {
              const st = stateOf(r);
              return (
                <div className="li" key={r.id}>
                  <div>
                    <div>{r.label || 'Sin nombre'}</div>
                    <div className="meta">
                      {st === 'usada' ? `Usada por ${r.used_email || 'una cuenta eliminada'} el ${when(r.used_at!)}` : st === 'vencida' ? `Venció el ${when(r.expires_at!)}` : `Creada el ${when(r.created_at)} · vence el ${when(r.expires_at!)}`}
                    </div>
                  </div>
                  {st === 'pendiente' ? (confirm === 'inv:' + r.id ? (
                    <span className="confirm">¿Anular? <button type="button" className="btn btn-sm btn-danger" onClick={() => revoke(r.id)}>Sí</button><button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirm('')}>No</button></span>
                  ) : (
                    <button type="button" className="btn btn-sm btn-ghost" onClick={() => setConfirm('inv:' + r.id)}>Anular</button>
                  )) : <span className={'tag' + (st === 'usada' ? ' ok' : '')}>{st === 'usada' ? 'Usada' : 'Vencida'}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
