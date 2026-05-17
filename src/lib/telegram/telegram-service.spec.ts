import {
  buildLeadInlineKeyboard,
  escapeTelegramHtml,
  redactProxyUrl,
  renderLandingLeadHtmlMessage,
} from "./telegram-service";

describe("telegram service helpers", () => {
  it("escapes telegram HTML", () => {
    expect(escapeTelegramHtml("A&B <tag>")).toBe("A&amp;B &lt;tag&gt;");
  });

  it("renders safe HTML message", () => {
    const text = renderLandingLeadHtmlMessage({
      leadUuid: "lead-1",
      createdAt: new Date("2026-05-16T00:00:00.000Z"),
      lead: {
        name: "Max <script>",
        contact: "maksim@example.com",
        message: "Coffee & loyalty",
      },
    });

    expect(text).toContain("<b>Новая заявка с лендинга WhiteBox</b>");
    expect(text).toContain("Max &lt;script&gt;");
    expect(text).toContain("Coffee &amp; loyalty");
  });

  it("builds lead actions", () => {
    expect(buildLeadInlineKeyboard({ leadUuid: "lead-1", leadUrl: "https://whitebox.test/admin/leads/1", contact: "@Hasumage" })).toEqual({
      inline_keyboard: [
        [{ text: "Открыть заявку", url: "https://whitebox.test/admin/leads/1" }],
        [{ text: "Открыть контакт в Telegram", url: "https://t.me/Hasumage" }],
        [
          { text: "В работу", callback_data: "lead:lead-1:in_progress" },
          { text: "Закрыть", callback_data: "lead:lead-1:closed" },
        ],
      ],
    });
  });

  it("does not send localhost urls to telegram inline buttons", () => {
    expect(buildLeadInlineKeyboard({ leadUrl: "http://localhost:3000/admin/leads/1" })?.inline_keyboard).toEqual([
      [
        { text: "В работу", callback_data: "lead:in_progress" },
        { text: "Закрыть", callback_data: "lead:closed" },
      ],
    ]);
  });

  it("redacts proxy credentials", () => {
    expect(redactProxyUrl("http://user:pass@127.0.0.1:10809")).toBe("http://***:***@127.0.0.1:10809/");
  });
});
