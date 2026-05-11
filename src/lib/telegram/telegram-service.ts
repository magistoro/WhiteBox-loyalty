export type TelegramRecipient = {
  chatId: string;
  label?: string;
};

export type LandingLead = {
  name: string;
  company?: string;
  contact: string;
  business?: string;
  message: string;
};

export function parseTelegramRecipients(rawRecipients?: string): TelegramRecipient[] {
  return (rawRecipients || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      const [chatId, label] = value.split(":");

      return {
        chatId: chatId.trim(),
        label: label?.trim() || undefined,
      };
    })
    .filter((recipient) => recipient.chatId.length > 0);
}

export function renderLandingLeadMessage(lead: LandingLead) {
  return [
    "WhiteBox landing lead",
    "",
    `Name: ${lead.name}`,
    `Company: ${lead.company || "not provided"}`,
    `Contact: ${lead.contact}`,
    `Business: ${lead.business || "not provided"}`,
    "",
    "Message:",
    lead.message,
  ].join("\n");
}

export async function sendTelegramMessage(params: {
  botToken: string;
  chatId: string;
  text: string;
}) {
  const response = await fetch(`https://api.telegram.org/bot${params.botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: params.chatId,
      text: params.text,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Telegram sendMessage failed: ${response.status} ${body}`);
  }
}

export async function sendTelegramBroadcast(params: {
  botToken: string;
  recipients: TelegramRecipient[];
  text: string;
}) {
  const results = await Promise.allSettled(
    params.recipients.map((recipient) =>
      sendTelegramMessage({
        botToken: params.botToken,
        chatId: recipient.chatId,
        text: params.text,
      }),
    ),
  );

  const failed = results.filter((result) => result.status === "rejected");

  if (failed.length > 0) {
    throw new Error(`Telegram broadcast failed for ${failed.length} recipient(s).`);
  }
}
