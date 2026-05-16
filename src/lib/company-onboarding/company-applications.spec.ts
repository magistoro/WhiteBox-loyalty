jest.mock("@/lib/prisma", () => ({
  prisma: {
    category: { findFirst: jest.fn() },
    user: { findUnique: jest.fn() },
    company: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  },
}));
jest.mock("@/lib/telegram/telegram-service", () => ({
  escapeTelegramHtml: (value: string) => value,
  sendTelegramMessage: jest.fn(),
}));
jest.mock("bcrypt", () => ({
  hash: jest.fn(async () => "hashed-company-password"),
}));

import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcrypt";
import { createCompanyVerificationApplication, onlyDigits, parseCompanyApplicationPayload } from "./company-applications";

const mockedPrisma = jest.mocked(prisma, { shallow: false });
const mockedBcrypt = jest.mocked(bcrypt);

process.env.PASSPORT_STORAGE_SECRET = "test-secret-with-enough-length";

describe("company application helpers", () => {
  const base = {
    employmentType: "SELF_EMPLOYED",
    identityVerificationMode: "FULL",
    contactName: "Max",
    contactEmail: "MAX@EXAMPLE.COM",
    password: "secure-password",
    passwordConfirm: "secure-password",
    companyName: "Coffee Club",
    businessCategory: "Coffee",
    legalLastName: "Пастухов",
    legalFirstName: "Максим",
    legalMiddleName: "",
    birthDate: "2000-01-01",
    legalInn: "123456789012",
    passportSeries: "1234",
    passportNumber: "567890",
    passportIssuedBy: "ОВД Тестового района",
    passportIssuedAt: "2020-01-01",
    passportPhotoProvided: true,
    consentAccepted: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("normalizes self-employed payload", () => {
    const payload = parseCompanyApplicationPayload(base);
    expect(payload.contactEmail).toBe("max@example.com");
    expect(payload.legalFullName).toBe("Пастухов Максим");
  });

  it("requires password and matching confirmation for company account creation", () => {
    expect(() => parseCompanyApplicationPayload({ ...base, password: "short", passwordConfirm: "short" })).toThrow("Password");
    expect(() => parseCompanyApplicationPayload({ ...base, passwordConfirm: "another-password" })).toThrow("Passwords do not match");
  });

  it("requires 12 digit INN for self-employed", () => {
    expect(() => parseCompanyApplicationPayload({ ...base, legalInn: "123" })).toThrow("12 digits");
  });

  it("blocks applicants younger than 16", () => {
    const nextYear = new Date().getUTCFullYear() + 1;
    expect(() => parseCompanyApplicationPayload({ ...base, birthDate: `${nextYear}-01-01` })).toThrow("16");
  });

  it("does not require payout or registration fields during the first intake", () => {
    const payload = parseCompanyApplicationPayload({ ...base, employmentType: "INDIVIDUAL_ENTREPRENEUR" });

    expect(payload.legalOgrnip).toBeUndefined();
    expect(payload.payoutBankName).toBeUndefined();
  });

  it("allows deferred verification with a business explanation", () => {
    const payload = parseCompanyApplicationPayload({
      ...base,
      identityVerificationMode: "DEFERRED",
      passportSeries: "",
      passportNumber: "",
      passportIssuedBy: "",
      passportIssuedAt: "",
      passportPhotoProvided: false,
      verificationDeferralReason: "I want to test the cabinet first and will provide passport verification before subscriptions and payouts.",
    });

    expect(payload.identityVerificationMode).toBe("DEFERRED");
    expect(payload.encryptedPassportData).toBeUndefined();
  });

  it("requires passport data and photo for full verification", () => {
    expect(() => parseCompanyApplicationPayload({ ...base, passportPhotoProvided: false })).toThrow("Passport photo");
    expect(() => parseCompanyApplicationPayload({ ...base, passportNumber: "" })).toThrow("passport data");
  });

  it("does not keep non-digits in financial identifiers", () => {
    expect(onlyDigits("BIK 044-525", 9)).toBe("044525");
  });

  it("creates company owner user and links the first company membership", async () => {
    const payload = parseCompanyApplicationPayload(base);
    mockedPrisma.category.findFirst.mockResolvedValue({ id: 9 } as never);
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    mockedPrisma.company.findUnique.mockResolvedValue(null);

    const tx = {
      user: { create: jest.fn().mockResolvedValue({ id: 41, email: "max@example.com" }) },
      company: { create: jest.fn().mockResolvedValue({ id: 77 }) },
      userCompany: { create: jest.fn().mockResolvedValue({ id: 1 }) },
      companyVerificationApplication: { create: jest.fn().mockResolvedValue({ id: 5, uuid: "application-1" }) },
      passportVerificationFile: { create: jest.fn() },
    };
    mockedPrisma.$transaction.mockImplementation(async (callback) => callback(tx as never));

    const result = await createCompanyVerificationApplication({ payload });

    expect(mockedBcrypt.hash).toHaveBeenCalledWith("secure-password", 12);
    expect(tx.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "max@example.com",
        name: "Max",
        role: "COMPANY",
        passwordHash: "hashed-company-password",
      }),
    });
    expect(tx.company.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerUserId: 41,
        isActive: false,
      }),
    });
    expect(tx.userCompany.create).toHaveBeenCalledWith({ data: { userId: 41, companyId: 77 } });
    expect(result.user.id).toBe(41);
  });
});
