import { extractLeadUuidFromText, labelFromLeadAction, parseLeadCallbackData, statusFromLeadAction } from "./telegram-webhook";

describe("telegram webhook helpers", () => {
  it("parses lead callback with uuid", () => {
    expect(parseLeadCallbackData("lead:b741f392-9952-48fe-9d69-4c1ded8226d6:closed")).toEqual({
      leadUuid: "b741f392-9952-48fe-9d69-4c1ded8226d6",
      action: "closed",
    });
  });

  it("keeps legacy callbacks parseable", () => {
    expect(parseLeadCallbackData("lead:in_progress")).toEqual({ leadUuid: null, action: "in_progress" });
  });

  it("maps actions to lead statuses", () => {
    expect(statusFromLeadAction("in_progress")).toBe("IN_PROGRESS");
    expect(statusFromLeadAction("closed")).toBe("CLOSED");
    expect(labelFromLeadAction("closed")).toBe("закрыта");
  });

  it("extracts uuid from telegram message text", () => {
    expect(extractLeadUuidFromText("Lead\nb741f392-9952-48fe-9d69-4c1ded8226d6\nThanks")).toBe(
      "b741f392-9952-48fe-9d69-4c1ded8226d6",
    );
  });
});
