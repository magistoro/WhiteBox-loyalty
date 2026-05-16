import "dotenv/config";
import { ProxyAgent, fetch as undiciFetch } from "undici";

const token = process.env.TELEGRAM_BOT_TOKEN;
const proxyUrl = process.env.TELEGRAM_PROXY_URL;
const localWebhookUrl = process.env.TELEGRAM_LOCAL_WEBHOOK_URL || "http://localhost:3000/api/telegram/webhook";
const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
const once = process.argv.includes("--once");
const fromNow = process.argv.includes("--from-now");

if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set.");

const dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

async function telegram(method, params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) query.set(key, String(value));
  }
  const suffix = query.toString() ? `?${query}` : "";
  const response = await undiciFetch(`https://api.telegram.org/bot${token}/${method}${suffix}`, { dispatcher });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    throw new Error(`${method} failed: ${response.status} ${JSON.stringify(data)}`);
  }
  return data.result;
}

async function forwardUpdate(update) {
  const headers = { "Content-Type": "application/json" };
  if (secretToken) headers["x-telegram-bot-api-secret-token"] = secretToken;

  const response = await fetch(localWebhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(update),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`local webhook failed: ${response.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  console.log(`Telegram local polling -> ${localWebhookUrl}`);
  if (proxyUrl) console.log("Telegram proxy enabled.");

  let offset;
  if (fromNow) {
    const latest = await telegram("getUpdates", { limit: 1, offset: -1, allowed_updates: JSON.stringify(["message", "callback_query"]) });
    if (latest[0]?.update_id !== undefined) offset = latest[0].update_id + 1;
    console.log(`Skipping backlog. Starting from update offset ${offset ?? "current"}.`);
  }

  do {
    const updates = await telegram("getUpdates", {
      timeout: once ? 0 : 25,
      limit: 20,
      offset,
      allowed_updates: JSON.stringify(["message", "callback_query"]),
    });

    for (const update of updates) {
      offset = update.update_id + 1;
      const result = await forwardUpdate(update);
      const text = update.message?.text || update.callback_query?.data || "update";
      console.log(`Processed ${update.update_id}: ${text} -> ${JSON.stringify(result)}`);
    }

    if (once) {
      if (offset !== undefined && updates.length > 0) {
        await telegram("getUpdates", { timeout: 0, limit: 1, offset });
      }
      break;
    }
  } while (true);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
