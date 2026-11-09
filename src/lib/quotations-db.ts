import crypto from "node:crypto";
import {
  prisma,
  withDatabaseTimeout,
  withDatabaseRetry,
  isUniqueConstraintError,
} from "@/lib/prisma";

export class IdempotencyConflictError extends Error {
  constructor(message = "Idempotency key was previously used with different request parameters.") {
    super(message);
    this.name = "IdempotencyConflictError";
  }
}

export function computeQuotationPayloadHash(data: {
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  currency?: string;
  totalAmount: number;
  subtotal: number;
  lineItems: any[];
}): string {
  const canonical = {
    clientEmail: data.clientEmail.toLowerCase().trim(),
    clientName: data.clientName.trim(),
    currency: data.currency || "INR",
    lineItems: Array.isArray(data.lineItems)
      ? data.lineItems.map((item) => ({
          title: item.title,
          amount: Number(item.amount),
          hours: Number(item.hours || 0),
          rate: Number(item.rate || 0),
        }))
      : [],
    projectTitle: data.projectTitle.trim(),
    subtotal: Number(data.subtotal) || 0,
    totalAmount: Number(data.totalAmount) || 0,
  };
  return crypto.createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export interface QuotationLineItem {
  id: string;
  title: string;
  description: string;
  hours?: number;
  rate?: number;
  amount: number;
}

export interface ProjectQuotationRecord {
  id: string;
  quotationNumber: string;
  idempotencyKey?: string | null;
  payloadHash?: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  clientCompany?: string | null;
  projectTitle: string;
  overview: string;
  currency: "INR" | "USD";
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  timeline: string;
  paymentSchedule: string;
  validUntil: string;
  lineItems: QuotationLineItem[];
  techStack: string[];
  termsAndNotes?: string | null;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  sentAt?: string | null;
  viewToken: string;
  createdAt: string;
  updatedAt: string;
}

export function generateQuotationNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `DG-QT-${year}-${randomSuffix}`;
}

export async function createQuotation(data: {
  quotationNumber?: string;
  idempotencyKey?: string | null;
  actorId?: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  clientCompany?: string | null;
  projectTitle: string;
  overview: string;
  currency?: "INR" | "USD";
  subtotal: number;
  discount?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  timeline: string;
  paymentSchedule: string;
  validUntil: string;
  lineItems: QuotationLineItem[];
  techStack?: string[];
  termsAndNotes?: string | null;
  status?: "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  sentAt?: string | null;
}): Promise<ProjectQuotationRecord> {
  const cleanIdempotencyKey = data.idempotencyKey && data.idempotencyKey.trim() ? data.idempotencyKey.trim() : null;
  // Actor-scoped idempotency key prevents cross-tenant or cross-actor collisions
  const scopedKey = cleanIdempotencyKey
    ? (data.actorId ? `usr_${data.actorId}:${cleanIdempotencyKey}` : cleanIdempotencyKey)
    : null;

  const currentPayloadHash = computeQuotationPayloadHash(data);

  // 1. Database-backed Idempotency check: if an idempotency key was specified, check PostgreSQL first
  if (scopedKey) {
    try {
      const existingByIdempotency = await prisma.projectQuotation.findUnique({
        where: { idempotencyKey: scopedKey },
      });
      if (existingByIdempotency) {
        // Payload Verification: ensure the key is not being reused with a different payload
        const isMatch = existingByIdempotency.payloadHash
          ? existingByIdempotency.payloadHash === currentPayloadHash
          : (
              existingByIdempotency.clientEmail.toLowerCase() === data.clientEmail.toLowerCase().trim() &&
              Math.abs(existingByIdempotency.totalAmount - data.totalAmount) < 0.01 &&
              existingByIdempotency.projectTitle.trim() === data.projectTitle.trim()
            );

        if (!isMatch) {
          throw new IdempotencyConflictError(
            `Idempotency key "${cleanIdempotencyKey}" was previously used with different request parameters.`
          );
        }

        console.info(`[Quotation Idempotency] Replaying existing quotation for "${cleanIdempotencyKey}".`);
        return serializePrismaQuotation(existingByIdempotency);
      }
    } catch (err: any) {
      if (err instanceof IdempotencyConflictError) throw err;
      console.warn(`[Quotation Idempotency] Lookup warning for key "${cleanIdempotencyKey}": ${err.message}`);
    }
  }

  const currency = data.currency || "INR";
  const discount = Number(data.discount) || 0;
  const taxRate = Number(data.taxRate) || 0;
  const taxAmount = Number(data.taxAmount) || 0;
  const techStack = data.techStack || [];
  const status = data.status || "DRAFT";
  const viewToken = `qt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    const quoteNumber = data.quotationNumber && attempts === 1 ? data.quotationNumber : generateQuotationNumber();

    try {
      const created = await withDatabaseTimeout(
        prisma.projectQuotation.create({
          data: {
            quotationNumber: quoteNumber,
            idempotencyKey: scopedKey,
            payloadHash: currentPayloadHash,
            clientName: data.clientName.trim(),
            clientEmail: data.clientEmail.toLowerCase().trim(),
            clientPhone: data.clientPhone?.trim() || null,
            clientCompany: data.clientCompany?.trim() || null,
            projectTitle: data.projectTitle.trim(),
            overview: data.overview.trim(),
            currency,
            subtotal: Number(data.subtotal),
            discount,
            taxRate,
            taxAmount,
            totalAmount: Number(data.totalAmount),
            timeline: data.timeline.trim(),
            paymentSchedule: data.paymentSchedule.trim(),
            validUntil: new Date(data.validUntil),
            lineItems: data.lineItems as any,
            techStack,
            termsAndNotes: data.termsAndNotes?.trim() || null,
            status,
            sentAt: data.sentAt ? new Date(data.sentAt) : null,
            viewToken,
          },
        }),
        10000,
        "createQuotation"
      );

      return serializePrismaQuotation(created);
    } catch (err: any) {
      // 2. Concurrency Race Defense: If another concurrent worker inserted this idempotencyKey
      if (scopedKey && isUniqueConstraintError(err)) {
        try {
          const raceWinner = await prisma.projectQuotation.findUnique({
            where: { idempotencyKey: scopedKey },
          });
          if (raceWinner) {
            const isMatch = raceWinner.payloadHash
              ? raceWinner.payloadHash === currentPayloadHash
              : (
                  raceWinner.clientEmail.toLowerCase() === data.clientEmail.toLowerCase().trim() &&
                  Math.abs(raceWinner.totalAmount - data.totalAmount) < 0.01 &&
                  raceWinner.projectTitle.trim() === data.projectTitle.trim()
                );

            if (!isMatch) {
              throw new IdempotencyConflictError(
                `Idempotency key "${cleanIdempotencyKey}" was concurrently used with different request parameters.`
              );
            }

            console.info(`[Quotation Idempotency] Concurrent race resolved for "${cleanIdempotencyKey}". Returning record.`);
            return serializePrismaQuotation(raceWinner);
          }
        } catch (raceErr) {
          if (raceErr instanceof IdempotencyConflictError) throw raceErr;
        }
      }

      // If collision was on random quotationNumber, retry with new random suffix
      if (isUniqueConstraintError(err) && attempts < 3) {
        console.warn(`[Quotation] Collision on quotationNumber "${quoteNumber}", retrying with new number...`);
        continue;
      }
      console.error("[Database Error] Failed to persist quotation to PostgreSQL:", err.message);
      throw new Error("Failed to create quotation. Database write could not be confirmed.");
    }
  }

  throw new Error("Failed to generate a unique quotation number. Please try again.");
}

export async function getAllQuotations(): Promise<ProjectQuotationRecord[]> {
  return withDatabaseRetry(
    async () => {
      const records = await withDatabaseTimeout(
        prisma.projectQuotation.findMany({
          orderBy: { createdAt: "desc" },
        }),
        6000,
        "getAllQuotations"
      );
      return (records || []).map(serializePrismaQuotation);
    },
    { isIdempotent: true, operationName: "getAllQuotations" }
  );
}

export async function getQuotationById(id: string): Promise<ProjectQuotationRecord | null> {
  return withDatabaseRetry(
    async () => {
      const record = await withDatabaseTimeout(
        prisma.projectQuotation.findUnique({
          where: { id },
        }),
        6000,
        "getQuotationById"
      );
      return record ? serializePrismaQuotation(record) : null;
    },
    { isIdempotent: true, operationName: "getQuotationById" }
  );
}

export async function getQuotationByToken(token: string): Promise<ProjectQuotationRecord | null> {
  return withDatabaseRetry(
    async () => {
      const record = await withDatabaseTimeout(
        prisma.projectQuotation.findUnique({
          where: { viewToken: token },
        }),
        6000,
        "getQuotationByToken"
      );
      return record ? serializePrismaQuotation(record) : null;
    },
    { isIdempotent: true, operationName: "getQuotationByToken" }
  );
}

export async function updateQuotation(
  id: string,
  data: Partial<Omit<ProjectQuotationRecord, "id" | "viewToken" | "createdAt" | "updatedAt">>
): Promise<ProjectQuotationRecord | null> {
  try {
    const updatePayload: any = {};
    if (data.clientName !== undefined) updatePayload.clientName = data.clientName.trim();
    if (data.clientEmail !== undefined) updatePayload.clientEmail = data.clientEmail.toLowerCase().trim();
    if (data.clientPhone !== undefined) updatePayload.clientPhone = data.clientPhone?.trim() || null;
    if (data.clientCompany !== undefined) updatePayload.clientCompany = data.clientCompany?.trim() || null;
    if (data.projectTitle !== undefined) updatePayload.projectTitle = data.projectTitle.trim();
    if (data.overview !== undefined) updatePayload.overview = data.overview.trim();
    if (data.currency !== undefined) updatePayload.currency = data.currency;
    if (data.subtotal !== undefined) updatePayload.subtotal = Number(data.subtotal);
    if (data.discount !== undefined) updatePayload.discount = Number(data.discount);
    if (data.taxRate !== undefined) updatePayload.taxRate = Number(data.taxRate);
    if (data.taxAmount !== undefined) updatePayload.taxAmount = Number(data.taxAmount);
    if (data.totalAmount !== undefined) updatePayload.totalAmount = Number(data.totalAmount);
    if (data.timeline !== undefined) updatePayload.timeline = data.timeline.trim();
    if (data.paymentSchedule !== undefined) updatePayload.paymentSchedule = data.paymentSchedule.trim();
    if (data.validUntil !== undefined) updatePayload.validUntil = new Date(data.validUntil);
    if (data.lineItems !== undefined) updatePayload.lineItems = data.lineItems;
    if (data.techStack !== undefined) updatePayload.techStack = data.techStack;
    if (data.termsAndNotes !== undefined) updatePayload.termsAndNotes = data.termsAndNotes?.trim() || null;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.sentAt !== undefined) updatePayload.sentAt = data.sentAt ? new Date(data.sentAt) : null;

    const updated = await withDatabaseTimeout(
      prisma.projectQuotation.update({
        where: { id },
        data: updatePayload,
      }),
      10000,
      "updateQuotation"
    );

    return serializePrismaQuotation(updated);
  } catch (err: any) {
    if (err?.code === "P2025") {
      return null; // Record not found
    }
    console.error("[Database Error] Failed to update quotation in PostgreSQL:", err.message);
    throw new Error("Failed to update quotation. Database write could not be confirmed.");
  }
}

export async function deleteQuotation(id: string): Promise<boolean> {
  try {
    await withDatabaseTimeout(
      prisma.projectQuotation.delete({
        where: { id },
      }),
      8000,
      "deleteQuotation"
    );
    return true;
  } catch (err: any) {
    if (err?.code === "P2025") {
      return false; // Already deleted / not found
    }
    console.error("[Database Error] Failed to delete quotation in PostgreSQL:", err.message);
    throw new Error("Failed to delete quotation. Database delete could not be confirmed.");
  }
}

function serializePrismaQuotation(rec: any): ProjectQuotationRecord {
  return {
    id: rec.id,
    quotationNumber: rec.quotationNumber,
    idempotencyKey: rec.idempotencyKey || null,
    payloadHash: rec.payloadHash || null,
    clientName: rec.clientName,
    clientEmail: rec.clientEmail,
    clientPhone: rec.clientPhone,
    clientCompany: rec.clientCompany,
    projectTitle: rec.projectTitle,
    overview: rec.overview,
    currency: rec.currency as "INR" | "USD",
    subtotal: rec.subtotal,
    discount: rec.discount,
    taxRate: rec.taxRate,
    taxAmount: rec.taxAmount,
    totalAmount: rec.totalAmount,
    timeline: rec.timeline,
    paymentSchedule: rec.paymentSchedule,
    validUntil: rec.validUntil instanceof Date ? rec.validUntil.toISOString() : rec.validUntil,
    lineItems: Array.isArray(rec.lineItems) ? rec.lineItems : [],
    techStack: Array.isArray(rec.techStack) ? rec.techStack : [],
    termsAndNotes: rec.termsAndNotes,
    status: rec.status as ProjectQuotationRecord["status"],
    sentAt: rec.sentAt ? (rec.sentAt instanceof Date ? rec.sentAt.toISOString() : rec.sentAt) : null,
    viewToken: rec.viewToken,
    createdAt: rec.createdAt instanceof Date ? rec.createdAt.toISOString() : rec.createdAt,
    updatedAt: rec.updatedAt instanceof Date ? rec.updatedAt.toISOString() : rec.updatedAt,
  };
}
