import crypto from "node:crypto";
import {
  prisma,
  withDatabaseTimeout,
  withDatabaseRetry,
  isUniqueConstraintError,
} from "@/lib/prisma";
import {
  InvoiceLineItem,
  BankDetails,
  ProjectInvoiceRecord,
  DEFAULT_BANK_DETAILS,
} from "@/types/invoice";

export * from "@/types/invoice";

export class IdempotencyConflictError extends Error {
  constructor(message = "Idempotency key was previously used with different request parameters.") {
    super(message);
    this.name = "IdempotencyConflictError";
  }
}

export function computeInvoicePayloadHash(data: {
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
          quantity: Number(item.quantity || 1),
          rate: Number(item.rate || 0),
        }))
      : [],
    projectTitle: data.projectTitle.trim(),
    subtotal: Number(data.subtotal) || 0,
    totalAmount: Number(data.totalAmount) || 0,
  };
  return crypto.createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `DG-INV-${year}-${randomSuffix}`;
}

export async function getAllInvoices(): Promise<ProjectInvoiceRecord[]> {
  return withDatabaseRetry(
    async () => {
      const records = await withDatabaseTimeout(
        prisma.projectInvoice.findMany({
          orderBy: { createdAt: "desc" },
        }),
        6000,
        "getAllInvoices"
      );
      return (records || []).map(serializePrismaInvoice);
    },
    { isIdempotent: true, operationName: "getAllInvoices" }
  );
}

export async function getInvoiceById(id: string): Promise<ProjectInvoiceRecord | null> {
  return withDatabaseRetry(
    async () => {
      const record = await withDatabaseTimeout(
        prisma.projectInvoice.findUnique({
          where: { id },
        }),
        6000,
        "getInvoiceById"
      );
      return record ? serializePrismaInvoice(record) : null;
    },
    { isIdempotent: true, operationName: "getInvoiceById" }
  );
}

export async function getInvoiceByToken(token: string): Promise<ProjectInvoiceRecord | null> {
  return withDatabaseRetry(
    async () => {
      const record = await withDatabaseTimeout(
        prisma.projectInvoice.findUnique({
          where: { viewToken: token },
        }),
        6000,
        "getInvoiceByToken"
      );
      return record ? serializePrismaInvoice(record) : null;
    },
    { isIdempotent: true, operationName: "getInvoiceByToken" }
  );
}

export async function createInvoice(data: {
  invoiceNumber?: string;
  idempotencyKey?: string | null;
  actorId?: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  clientCompany?: string | null;
  clientAddress?: string | null;
  clientGstin?: string | null;
  projectTitle: string;
  overview?: string | null;
  currency?: "INR" | "USD";
  subtotal: number;
  discount?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  issueDate?: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  paymentTerms?: string | null;
  bankDetails?: BankDetails | null;
  notes?: string | null;
  status?: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  paidAt?: string | null;
  sentAt?: string | null;
}): Promise<ProjectInvoiceRecord> {
  const cleanIdempotencyKey = data.idempotencyKey && data.idempotencyKey.trim() ? data.idempotencyKey.trim() : null;
  // Actor-scoped idempotency key prevents cross-tenant or cross-actor collisions
  const scopedKey = cleanIdempotencyKey
    ? (data.actorId ? `usr_${data.actorId}:${cleanIdempotencyKey}` : cleanIdempotencyKey)
    : null;

  const currentPayloadHash = computeInvoicePayloadHash(data);

  // 1. Database-backed Idempotency check: if an idempotency key was specified, check PostgreSQL first
  if (scopedKey) {
    try {
      const existingByIdempotency = await prisma.projectInvoice.findUnique({
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

        console.info(`[Invoice Idempotency] Replaying existing invoice for idempotencyKey "${cleanIdempotencyKey}".`);
        return serializePrismaInvoice(existingByIdempotency);
      }
    } catch (err: any) {
      if (err instanceof IdempotencyConflictError) throw err;
      console.warn(`[Invoice Idempotency] Lookup warning for key "${cleanIdempotencyKey}": ${err.message}`);
    }
  }

  const token = `inv_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
  const now = new Date().toISOString();
  const issueDateStr = data.issueDate || now;
  const bankInfo = data.bankDetails || DEFAULT_BANK_DETAILS;

  // Collision-resistant creation loop for invoiceNumber
  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    const invNumber = data.invoiceNumber && attempts === 1 ? data.invoiceNumber : generateInvoiceNumber();

    try {
      const created = await withDatabaseTimeout(
        prisma.projectInvoice.create({
          data: {
            invoiceNumber: invNumber,
            idempotencyKey: scopedKey,
            payloadHash: currentPayloadHash,
            clientName: data.clientName.trim(),
            clientEmail: data.clientEmail.toLowerCase().trim(),
            clientPhone: data.clientPhone || null,
            clientCompany: data.clientCompany || null,
            clientAddress: data.clientAddress || null,
            clientGstin: data.clientGstin || null,
            projectTitle: data.projectTitle.trim(),
            overview: data.overview || null,
            currency: data.currency || "INR",
            subtotal: data.subtotal,
            discount: data.discount || 0,
            taxRate: data.taxRate || 0,
            taxAmount: data.taxAmount || 0,
            totalAmount: data.totalAmount,
            issueDate: new Date(issueDateStr),
            dueDate: new Date(data.dueDate),
            lineItems: data.lineItems as any,
            paymentTerms: data.paymentTerms || "Full payment due within 2 days of invoice date.",
            bankDetails: bankInfo as any,
            notes: data.notes || null,
            status: data.status || "DRAFT",
            paidAt: data.paidAt ? new Date(data.paidAt) : null,
            sentAt: data.sentAt ? new Date(data.sentAt) : null,
            viewToken: token,
          },
        }),
        10000,
        "createInvoice"
      );
      return serializePrismaInvoice(created);
    } catch (err: any) {
      // 2. Concurrency Race Defense: If another concurrent worker inserted this idempotencyKey
      if (scopedKey && isUniqueConstraintError(err)) {
        try {
          const raceWinner = await prisma.projectInvoice.findUnique({
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

            console.info(`[Invoice Idempotency] Concurrent race resolved for "${cleanIdempotencyKey}". Returning record.`);
            return serializePrismaInvoice(raceWinner);
          }
        } catch (raceErr) {
          if (raceErr instanceof IdempotencyConflictError) throw raceErr;
        }
      }

      // If collision was on random invoiceNumber, retry with new random suffix
      if (isUniqueConstraintError(err) && attempts < 3) {
        console.warn(`[Invoice] Collision on invoiceNumber "${invNumber}", retrying with new number...`);
        continue;
      }
      console.error("[Database Error] Failed to persist invoice to PostgreSQL:", err.message);
      throw new Error("Failed to create invoice. Database write could not be confirmed.");
    }
  }

  throw new Error("Failed to generate a unique invoice number. Please try again.");
}

export async function updateInvoice(
  id: string,
  updates: Partial<ProjectInvoiceRecord>
): Promise<ProjectInvoiceRecord | null> {
  try {
    const dataToUpdate: any = { ...updates };
    delete dataToUpdate.id;
    delete dataToUpdate.createdAt;
    dataToUpdate.updatedAt = new Date();

    if (updates.issueDate) dataToUpdate.issueDate = new Date(updates.issueDate);
    if (updates.dueDate) dataToUpdate.dueDate = new Date(updates.dueDate);
    if (updates.paidAt) dataToUpdate.paidAt = new Date(updates.paidAt);
    if (updates.sentAt) dataToUpdate.sentAt = new Date(updates.sentAt);

    const updated = await withDatabaseTimeout(
      prisma.projectInvoice.update({
        where: { id },
        data: dataToUpdate,
      }),
      10000,
      "updateInvoice"
    );
    return serializePrismaInvoice(updated);
  } catch (err: any) {
    if (err?.code === "P2025") {
      return null; // Record not found
    }
    console.error("[Database Error] Failed to update invoice in PostgreSQL:", err.message);
    throw new Error("Failed to update invoice. Database write could not be confirmed.");
  }
}

export async function deleteInvoice(id: string): Promise<boolean> {
  try {
    await withDatabaseTimeout(
      prisma.projectInvoice.delete({
        where: { id },
      }),
      8000,
      "deleteInvoice"
    );
    return true;
  } catch (err: any) {
    if (err?.code === "P2025") {
      return false; // Already deleted / not found
    }
    console.error("[Database Error] Failed to delete invoice in PostgreSQL:", err.message);
    throw new Error("Failed to delete invoice. Database delete could not be confirmed.");
  }
}

function serializePrismaInvoice(rec: any): ProjectInvoiceRecord {
  return {
    id: rec.id,
    invoiceNumber: rec.invoiceNumber,
    idempotencyKey: rec.idempotencyKey || null,
    payloadHash: rec.payloadHash || null,
    clientName: rec.clientName,
    clientEmail: rec.clientEmail,
    clientPhone: rec.clientPhone,
    clientCompany: rec.clientCompany,
    clientAddress: rec.clientAddress,
    clientGstin: rec.clientGstin,
    projectTitle: rec.projectTitle,
    overview: rec.overview,
    currency: rec.currency as "INR" | "USD",
    subtotal: rec.subtotal,
    discount: rec.discount,
    taxRate: rec.taxRate,
    taxAmount: rec.taxAmount,
    totalAmount: rec.totalAmount,
    issueDate: rec.issueDate instanceof Date ? rec.issueDate.toISOString() : rec.issueDate,
    dueDate: rec.dueDate instanceof Date ? rec.dueDate.toISOString() : rec.dueDate,
    lineItems: Array.isArray(rec.lineItems) ? rec.lineItems : [],
    paymentTerms: rec.paymentTerms,
    bankDetails: rec.bankDetails || DEFAULT_BANK_DETAILS,
    notes: rec.notes,
    status: rec.status as any,
    paidAt: rec.paidAt ? (rec.paidAt instanceof Date ? rec.paidAt.toISOString() : rec.paidAt) : null,
    sentAt: rec.sentAt ? (rec.sentAt instanceof Date ? rec.sentAt.toISOString() : rec.sentAt) : null,
    viewToken: rec.viewToken,
    createdAt: rec.createdAt instanceof Date ? rec.createdAt.toISOString() : rec.createdAt,
    updatedAt: rec.updatedAt instanceof Date ? rec.updatedAt.toISOString() : rec.updatedAt,
  };
}
