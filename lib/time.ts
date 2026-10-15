// Fechas en hora de Lima (America/Lima, sin horario de verano).
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_L = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const WDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

const fmtDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' });
const fmtHour = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Lima', hour: 'numeric', hourCycle: 'h23' });

export function limaDay(d: Date) { return fmtDay.format(d); }
export function limaHour(d: Date) { return Number(fmtHour.format(d)) % 24; }
export function today() { return limaDay(new Date()); }
export function dayAdd(day: string, n: number) { const d = new Date(day + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
export function daysBetween(a: string, b: string) { return Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5); }
export function dayShort(day: string) { const d = new Date(day + 'T12:00:00Z'); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]; }
export function dayLong(day: string) { const d = new Date(day + 'T12:00:00Z'); return WDAYS[d.getUTCDay()] + ' ' + d.getUTCDate() + ' de ' + MONTHS_L[d.getUTCMonth()]; }
export function timeOf(ts: string) { return new Date(ts).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: 'numeric', minute: '2-digit' }); }
export function money(n: number) { return 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
export function pct(a: number, b: number) { return b ? Math.round((a / b) * 100) + ' %' : '—'; }
