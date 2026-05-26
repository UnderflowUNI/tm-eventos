// Integração opcional com Google Calendar.
// Veja README.md → seção "Google Calendar" para tutorial passo-a-passo.

import { google } from "googleapis";

function getClient() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) return null;

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
  return google.calendar({ version: "v3", auth });
}

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function nextDayStr(d: Date) {
  const n = new Date(d);
  n.setDate(n.getDate() + 1);
  return toDateStr(n);
}

export async function pushEventToGoogle(opts: {
  title: string;
  date: Date;        // primeiro dia
  endDate?: Date;    // último dia (inclusive); se omitido = mesmo dia de date
  description?: string;
}): Promise<string | null> {
  const cal = getClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!cal || !calendarId) return null;

  const end = opts.endDate || opts.date;

  try {
    const res = await cal.events.insert({
      calendarId,
      requestBody: {
        summary: opts.title,
        description: opts.description,
        start: { date: toDateStr(opts.date) },
        end: { date: nextDayStr(end) }, // gcal trata end como exclusivo em all-day
      },
    });
    return res.data.id || null;
  } catch (e) {
    console.error("[gcal] insert error:", e);
    return null;
  }
}

export async function deleteEventFromGoogle(eventId: string): Promise<boolean> {
  const cal = getClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!cal || !calendarId) return false;

  try {
    await cal.events.delete({ calendarId, eventId });
    return true;
  } catch (e: any) {
    // 410/404 = já foi apagado — não é erro
    if (e?.code === 410 || e?.code === 404) return true;
    console.error("[gcal] delete error:", e);
    return false;
  }
}

export async function listGoogleEvents(start: Date, end: Date) {
  const cal = getClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!cal || !calendarId) return [];

  try {
    const res = await cal.events.list({
      calendarId,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });
    return res.data.items || [];
  } catch (e) {
    console.error("[gcal] list error:", e);
    return [];
  }
}
