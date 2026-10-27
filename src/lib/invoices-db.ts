import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import {
  InvoiceLineItem,
  BankDetails,
  ProjectInvoiceRecord,
  DEFAULT_BANK_DETAILS,
} from "@/types/invoice";

export * from "@/types/invoice";

const LOCAL_STORE_PATH = path.join(process.cwd(), "data", "invoices.json");

function ensureLocalStore(): ProjectInvoiceRecord[] {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_STORE_PATH)) {
      fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const raw = fs.readFileSync(LOCAL_STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalStore(items: ProjectInvoiceRecord[]) {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to local invoices store:", err);
  }
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `DG-INV-${year}-${randomSuffix}`;
}

export async function getAllInvoices(): Promise<ProjectInvoiceRecord[]> {
  try {
    if (prisma?.projectInvoice) {
      const records = await prisma.projectInvoice.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (records && records.length > 0) {
        return records.map(serializePrismaInvoice);
      }
    }
  } catch (err: any) {
    console.warn("Prisma projectInvoice table lookup failed, using local store:", err.message);
  }

  const local = ensureLocalStore();
  return local.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getInvoiceById(id: string): Promise<ProjectInvoiceRecord | null> {
  try {
    if (prisma?.projectInvoice) {
      const record = await prisma.projectInvoice.findUnique({
        where: { id },
      });
      if (record) return serializePrismaInvoice(record);
    }
  } catch (err: any) {
    console.warn("Prisma getInvoiceById failed, using local store:", err.message);
  }

  const local = ensureLocalStore();
  return local.find((inv) => inv.id === id) || null;
}

export async function getInvoiceByToken(token: string): Promise<ProjectInvoiceRecord | null> {
  try {
    if (prisma?.projectInvoice) {
      const record = await prisma.projectInvoice.findUnique({
        where: { viewToken: token },
      });
      if (record) return serializePrismaInvoice(record);
    }
  } catch (err: any) {
    console.warn("Prisma getInvoiceByToken failed, using local store:", err.message);
  }

  const local = ensureLocalStore();
  return local.find((inv) => inv.viewToken === token) || null;
}

export async function createInvoice(data: {
  invoiceNumber?: string;
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
  const invNumber = data.invoiceNumber || generateInvoiceNumber();
  const token = `inv_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
  const now = new Date().toISOString();
  const issueDateStr = data.issueDate || now;
  const bankInfo = data.bankDetails || DEFAULT_BANK_DETAILS;

  try {
    if (prisma?.projectInvoice) {
      const created = await prisma.projectInvoice.create({
        data: {
          invoiceNumber: invNumber,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone || null,
          clientCompany: data.clientCompany || null,
          clientAddress: data.clientAddress || null,
          clientGstin: data.clientGstin || null,
          projectTitle: data.projectTitle,
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
          paymentTerms: data.paymentTerms || "Full payment due within 14 days of invoice date.",
          bankDetails: bankInfo as any,
          notes: data.notes || null,
          status: data.status || "DRAFT",
          paidAt: data.paidAt ? new Date(data.paidAt) : null,
          sentAt: data.sentAt ? new Date(data.sentAt) : null,
          viewToken: token,
        },
      });
      return serializePrismaInvoice(created);
    }
  } catch (err: any) {
    console.warn("Prisma projectInvoice.create failed, falling back to local file:", err.message);
  }

  const newRecord: ProjectInvoiceRecord = {
    id: `local_inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    invoiceNumber: invNumber,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone || null,
    clientCompany: data.clientCompany || null,
    clientAddress: data.clientAddress || null,
    clientGstin: data.clientGstin || null,
    projectTitle: data.projectTitle,
    overview: data.overview || null,
    currency: data.currency || "INR",
    subtotal: data.subtotal,
    discount: data.discount || 0,
    taxRate: data.taxRate || 0,
    taxAmount: data.taxAmount || 0,
    totalAmount: data.totalAmount,
    issueDate: issueDateStr,
    dueDate: data.dueDate,
    lineItems: data.lineItems,
    paymentTerms: data.paymentTerms || "Full payment due within 14 days of invoice date.",
    bankDetails: bankInfo,
    notes: data.notes || null,
    status: data.status || "DRAFT",
    paidAt: data.paidAt || null,
    sentAt: data.sentAt || null,
    viewToken: token,
    createdAt: now,
    updatedAt: now,
  };

  const list = ensureLocalStore();
  list.unshift(newRecord);
  writeLocalStore(list);
  return newRecord;
}

export async function updateInvoice(
  id: string,
  updates: Partial<ProjectInvoiceRecord>
): Promise<ProjectInvoiceRecord | null> {
  const now = new Date().toISOString();

  try {
    if (prisma?.projectInvoice) {
      const dataToUpdate: any = { ...updates };
      delete dataToUpdate.id;
      delete dataToUpdate.createdAt;
      dataToUpdate.updatedAt = new Date();

      if (updates.issueDate) dataToUpdate.issueDate = new Date(updates.issueDate);
      if (updates.dueDate) dataToUpdate.dueDate = new Date(updates.dueDate);
      if (updates.paidAt) dataToUpdate.paidAt = new Date(updates.paidAt);
      if (updates.sentAt) dataToUpdate.sentAt = new Date(updates.sentAt);

      const updated = await prisma.projectInvoice.update({
        where: { id },
        data: dataToUpdate,
      });
      return serializePrismaInvoice(updated);
    }
  } catch (err: any) {
    console.warn("Prisma projectInvoice.update failed, updating local file:", err.message);
  }

  const list = ensureLocalStore();
  const idx = list.findIndex((inv) => inv.id === id);
  if (idx === -1) return null;

  const updatedRecord = {
    ...list[idx],
    ...updates,
    updatedAt: now,
  };
  list[idx] = updatedRecord;
  writeLocalStore(list);
  return updatedRecord;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  try {
    if (prisma?.projectInvoice) {
      await prisma.projectInvoice.delete({
        where: { id },
      });
      return true;
    }
  } catch (err: any) {
    console.warn("Prisma projectInvoice.delete failed, deleting from local file:", err.message);
  }

  const list = ensureLocalStore();
  const filtered = list.filter((inv) => inv.id !== id);
  writeLocalStore(filtered);
  return true;
}

function serializePrismaInvoice(rec: any): ProjectInvoiceRecord {
  return {
    id: rec.id,
    invoiceNumber: rec.invoiceNumber,
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
