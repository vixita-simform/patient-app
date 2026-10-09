import type { MedicalInfoResponse, UpdateMedicalInfoRequest } from "@patient-app/shared-types";
import { afterEach, describe, expect, it, vi } from "vitest";

import { dynamic, GET, PUT } from "../../src/app/api/patients/me/medical-info/route";
import { issueAccessToken } from "../../src/lib";
import * as medicalInfoService from "../../src/services/medicalInfo";

const URL = "http://localhost/api/patients/me/medical-info";
const AUTH = { authorization: `Bearer ${issueAccessToken("42")}` };

const medicalInfo: MedicalInfoResponse = {
  patient: {
    id: "42",
    uhid: "CW-2024-08813",
    firstName: "Aarav",
    lastName: "Sharma",
    phone: "+919876543210",
    email: "aarav@example.com",
    gender: "male",
    bloodGroup: "O+",
    dateOfBirth: "1992-03-14",
    weight: 72,
  },
  allergies: [{ id: "1", allergen: "Penicillin" }],
  conditions: [{ id: "7", name: "Mild hypertension" }],
  emergencyContact: { id: "3", name: "Priya Sharma", relation: "Spouse", phone: "+919800000000" },
};

const validBody: UpdateMedicalInfoRequest = {
  firstName: "Aarav",
  lastName: "Sharma",
  dateOfBirth: "1992-03-14",
  gender: "male",
  bloodGroup: "O+",
  allergies: ["Penicillin"],
  conditions: ["Mild hypertension"],
  emergencyContactName: "Priya Sharma",
};

const put = (body: unknown, headers: Record<string, string> = AUTH): Request =>
  new Request(URL, { method: "PUT", headers, body: JSON.stringify(body) });

describe("/api/patients/me/medical-info", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is never statically prerendered", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("GET returns the signed-in patient's medical info", async () => {
    const getMedicalInfo = vi.spyOn(medicalInfoService, "getMedicalInfo").mockResolvedValue(medicalInfo);
    const response = await GET(new Request(URL, { headers: AUTH }));
    expect(response.status).toBe(200);
    expect(getMedicalInfo).toHaveBeenCalledWith("42");
    expect(await response.json()).toEqual(medicalInfo);
  });

  it("GET returns 404 when the patient does not exist", async () => {
    vi.spyOn(medicalInfoService, "getMedicalInfo").mockResolvedValue(null);
    const response = await GET(new Request(URL, { headers: AUTH }));
    expect(response.status).toBe(404);
  });

  it("GET and PUT return 401 without a token", async () => {
    const getMedicalInfo = vi.spyOn(medicalInfoService, "getMedicalInfo");
    const updateMedicalInfo = vi.spyOn(medicalInfoService, "updateMedicalInfo");
    expect((await GET(new Request(URL))).status).toBe(401);
    expect((await PUT(put(validBody, {}))).status).toBe(401);
    expect(getMedicalInfo).not.toHaveBeenCalled();
    expect(updateMedicalInfo).not.toHaveBeenCalled();
  });

  it("PUT saves trimmed, de-duplicated input for the signed-in patient", async () => {
    const updateMedicalInfo = vi.spyOn(medicalInfoService, "updateMedicalInfo").mockResolvedValue(medicalInfo);
    const response = await PUT(
      put({
        ...validBody,
        firstName: "  Aarav ",
        allergies: ["Penicillin", " penicillin ", "Peanuts"],
        emergencyContactName: null,
      }),
    );
    expect(response.status).toBe(200);
    expect(updateMedicalInfo).toHaveBeenCalledWith("42", {
      ...validBody,
      firstName: "Aarav",
      allergies: ["Penicillin", "Peanuts"],
      emergencyContactName: null,
    });
    expect(await response.json()).toEqual(medicalInfo);
  });

  it.each([
    ["an empty first name", { firstName: " " }],
    ["an unknown gender", { gender: "unknown" }],
    ["an unknown blood group", { bloodGroup: "C+" }],
    ["an impossible date", { dateOfBirth: "1992-02-30" }],
    ["a future date", { dateOfBirth: "2999-01-01" }],
    ["a non-list of allergies", { allergies: "Penicillin" }],
    ["an empty condition", { conditions: [""] }],
    ["too many allergies", { allergies: Array.from({ length: 51 }, (_, i) => `a${i}`) }],
    ["an overlong contact name", { emergencyContactName: "x".repeat(151) }],
  ])("PUT returns 400 for %s", async (_name, change) => {
    const updateMedicalInfo = vi.spyOn(medicalInfoService, "updateMedicalInfo");
    const response = await PUT(put({ ...validBody, ...change }));
    expect(response.status).toBe(400);
    expect(updateMedicalInfo).not.toHaveBeenCalled();
  });

  it("PUT returns 400 for a body that is not JSON", async () => {
    const response = await PUT(new Request(URL, { method: "PUT", headers: AUTH, body: "nope" }));
    expect(response.status).toBe(400);
  });

  it("PUT returns a generic 500 when the service fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(medicalInfoService, "updateMedicalInfo").mockRejectedValue(new Error("db down"));
    const response = await PUT(put(validBody));
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("db down");
  });
});
