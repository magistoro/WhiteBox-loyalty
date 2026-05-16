jest.mock("@/lib/prisma", () => ({
  prisma: {
    userProfilePreference: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
}));

import { NextRequest } from "next/server";
import { GET, POST } from "./route";

describe("i18n locale route", () => {
  it("rejects unsupported locales", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/i18n/locale", {
        method: "POST",
        body: JSON.stringify({ locale: "de" }),
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toContain("Unsupported");
  });

  it("sets locale cookie for anonymous users", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/i18n/locale", {
        method: "POST",
        body: JSON.stringify({ locale: "ru" }),
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.locale).toBe("ru");
    expect(res.headers.get("set-cookie")).toContain("wb_locale=ru");
  });

  it("returns cookie locale when no authenticated preference exists", async () => {
    const res = await GET(
      new NextRequest("http://localhost/api/i18n/locale", {
        headers: { cookie: "wb_locale=ru" },
      }),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.locale).toBe("ru");
  });
});
