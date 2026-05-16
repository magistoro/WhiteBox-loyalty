import type { LandingLeadStatus } from "@prisma/client";

export type TelegramCallbackAction = "in_progress" | "closed";

export type ParsedLeadCallback = {
  leadUuid: string | null;
  action: TelegramCallbackAction;
};

export function parseLeadCallbackData(value: unknown): ParsedLeadCallback | null {
  if (typeof value !== "string") return null;

  const parts = value.split(":");
  if (parts.length === 3 && parts[0] === "lead") {
    const [, leadUuid, action] = parts;
    if (isLeadAction(action)) return { leadUuid, action };
  }

  // Legacy buttons from earlier builds did not include lead uuid.
  if (parts.length === 2 && parts[0] === "lead") {
    const [, action] = parts;
    if (isLeadAction(action)) return { leadUuid: null, action };
  }

  return null;
}

export function statusFromLeadAction(action: TelegramCallbackAction): LandingLeadStatus {
  return action === "closed" ? "CLOSED" : "IN_PROGRESS";
}

export function labelFromLeadAction(action: TelegramCallbackAction) {
  return action === "closed" ? "закрыта" : "в работе";
}

export function extractLeadUuidFromText(value: unknown) {
  if (typeof value !== "string") return null;
  return value.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0] ?? null;
}

function isLeadAction(value: string): value is TelegramCallbackAction {
  return value === "in_progress" || value === "closed";
}
