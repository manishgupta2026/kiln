import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

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

const LOCAL_STORE_PATH = path.join(process.cwd(), "data", "quotations.json");

function ensureLocalStore(): ProjectQuotationRecord[] {
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

function writeLocalStore(items: ProjectQuotationRecord[]) {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to local quotations fallback:", err);
  }
}

export function generateQuotationNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `DG-QT-${year}-${randomSuffix}`;
}

export async function createQuotation(data: {
  quotationNumber?: string;
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
  const quoteNumber = data.quotationNumber || generateQuotationNumber();
  const currency = data.currency || "INR";
  const discount = Number(data.discount) || 0;
  const taxRate = Number(data.taxRate) || 0;
  const taxAmount = Number(data.taxAmount) || 0;
  const techStack = data.techStack || [];
  const status = data.status || "DRAFT";
  const viewToken = `qt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  try {
    const created = await (prisma as any).projectQuotation.create({
      data: {
        quotationNumber: quoteNumber,
        clientName: data.clientName.trim(),
        clientEmail: data.clientEmail.trim(),
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
        lineItems: data.lineItems,
        techStack,
        termsAndNotes: data.termsAndNotes?.trim() || null,
        status,
        sentAt: data.sentAt ? new Date(data.sentAt) : null,
        viewToken,
      },
    });

    return {
      id: created.id,
      quotationNumber: created.quotationNumber,
      clientName: created.clientName,
      clientEmail: created.clientEmail,
      clientPhone: created.clientPhone,
      clientCompany: created.clientCompany,
      projectTitle: created.projectTitle,
      overview: created.overview,
      currency: created.currency as "INR" | "USD",
      subtotal: created.subtotal,
      discount: created.discount,
      taxRate: created.taxRate,
      taxAmount: created.taxAmount,
      totalAmount: created.totalAmount,
      timeline: created.timeline,
      paymentSchedule: created.paymentSchedule,
      validUntil: created.validUntil.toISOString(),
      lineItems: created.lineItems as unknown as QuotationLineItem[],
      techStack: created.techStack,
      termsAndNotes: created.termsAndNotes,
      status: created.status as ProjectQuotationRecord["status"],
      sentAt: created.sentAt ? created.sentAt.toISOString() : null,
      viewToken: created.viewToken,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  } catch (dbError) {
    console.warn(
      "[Database Warning] PostgreSQL unreachable via Prisma. Falling back to local data store for quotations. Error:",
      (dbError as Error).message
    );

    const store = ensureLocalStore();
    const newRecord: ProjectQuotationRecord = {
      id: `local_qt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      quotationNumber: quoteNumber,
      clientName: data.clientName.trim(),
      clientEmail: data.clientEmail.trim(),
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
      validUntil: new Date(data.validUntil).toISOString(),
      lineItems: data.lineItems,
      techStack,
      termsAndNotes: data.termsAndNotes?.trim() || null,
      status,
      sentAt: data.sentAt ? new Date(data.sentAt).toISOString() : null,
      viewToken,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.unshift(newRecord);
    writeLocalStore(store);
    return newRecord;
  }
}

export async function getAllQuotations(): Promise<ProjectQuotationRecord[]> {
  try {
    const records = await (prisma as any).projectQuotation.findMany({
      orderBy: { createdAt: "desc" },
    });

    return records.map((r: any) => ({
      id: r.id,
      quotationNumber: r.quotationNumber,
      clientName: r.clientName,
      clientEmail: r.clientEmail,
      clientPhone: r.clientPhone,
      clientCompany: r.clientCompany,
      projectTitle: r.projectTitle,
      overview: r.overview,
      currency: r.currency as "INR" | "USD",
      subtotal: r.subtotal,
      discount: r.discount,
      taxRate: r.taxRate,
      taxAmount: r.taxAmount,
      totalAmount: r.totalAmount,
      timeline: r.timeline,
      paymentSchedule: r.paymentSchedule,
      validUntil: r.validUntil.toISOString(),
      lineItems: r.lineItems as unknown as QuotationLineItem[],
      techStack: r.techStack,
      termsAndNotes: r.termsAndNotes,
      status: r.status as ProjectQuotationRecord["status"],
      sentAt: r.sentAt ? r.sentAt.toISOString() : null,
      viewToken: r.viewToken,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (dbError) {
    console.warn(
      "[Database Warning] PostgreSQL unreachable via Prisma. Falling back to local store for quotations.",
      (dbError as Error).message
    );
    const store = ensureLocalStore();
    return store.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export async function getQuotationById(id: string): Promise<ProjectQuotationRecord | null> {
  try {
    const r = await (prisma as any).projectQuotation.findUnique({
      where: { id },
    });
    if (!r) return null;

    return {
      id: r.id,
      quotationNumber: r.quotationNumber,
      clientName: r.clientName,
      clientEmail: r.clientEmail,
      clientPhone: r.clientPhone,
      clientCompany: r.clientCompany,
      projectTitle: r.projectTitle,
      overview: r.overview,
      currency: r.currency as "INR" | "USD",
      subtotal: r.subtotal,
      discount: r.discount,
      taxRate: r.taxRate,
      taxAmount: r.taxAmount,
      totalAmount: r.totalAmount,
      timeline: r.timeline,
      paymentSchedule: r.paymentSchedule,
      validUntil: r.validUntil.toISOString(),
      lineItems: r.lineItems as unknown as QuotationLineItem[],
      techStack: r.techStack,
      termsAndNotes: r.termsAndNotes,
      status: r.status as ProjectQuotationRecord["status"],
      sentAt: r.sentAt ? r.sentAt.toISOString() : null,
      viewToken: r.viewToken,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  } catch {
    const store = ensureLocalStore();
    return store.find((q) => q.id === id) || null;
  }
}

export async function getQuotationByToken(token: string): Promise<ProjectQuotationRecord | null> {
  try {
    const r = await (prisma as any).projectQuotation.findUnique({
      where: { viewToken: token },
    });
    if (!r) return null;

    return {
      id: r.id,
      quotationNumber: r.quotationNumber,
      clientName: r.clientName,
      clientEmail: r.clientEmail,
      clientPhone: r.clientPhone,
      clientCompany: r.clientCompany,
      projectTitle: r.projectTitle,
      overview: r.overview,
      currency: r.currency as "INR" | "USD",
      subtotal: r.subtotal,
      discount: r.discount,
      taxRate: r.taxRate,
      taxAmount: r.taxAmount,
      totalAmount: r.totalAmount,
      timeline: r.timeline,
      paymentSchedule: r.paymentSchedule,
      validUntil: r.validUntil.toISOString(),
      lineItems: r.lineItems as unknown as QuotationLineItem[],
      techStack: r.techStack,
      termsAndNotes: r.termsAndNotes,
      status: r.status as ProjectQuotationRecord["status"],
      sentAt: r.sentAt ? r.sentAt.toISOString() : null,
      viewToken: r.viewToken,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  } catch {
    const store = ensureLocalStore();
    return store.find((q) => q.viewToken === token) || null;
  }
}

export async function updateQuotation(
  id: string,
  data: Partial<Omit<ProjectQuotationRecord, "id" | "viewToken" | "createdAt" | "updatedAt">>
): Promise<ProjectQuotationRecord | null> {
  try {
    const updatePayload: any = {};
    if (data.clientName !== undefined) updatePayload.clientName = data.clientName.trim();
    if (data.clientEmail !== undefined) updatePayload.clientEmail = data.clientEmail.trim();
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

    const updated = await (prisma as any).projectQuotation.update({
      where: { id },
      data: updatePayload,
    });

    return {
      id: updated.id,
      quotationNumber: updated.quotationNumber,
      clientName: updated.clientName,
      clientEmail: updated.clientEmail,
      clientPhone: updated.clientPhone,
      clientCompany: updated.clientCompany,
      projectTitle: updated.projectTitle,
      overview: updated.overview,
      currency: updated.currency as "INR" | "USD",
      subtotal: updated.subtotal,
      discount: updated.discount,
      taxRate: updated.taxRate,
      taxAmount: updated.taxAmount,
      totalAmount: updated.totalAmount,
      timeline: updated.timeline,
      paymentSchedule: updated.paymentSchedule,
      validUntil: updated.validUntil.toISOString(),
      lineItems: updated.lineItems as unknown as QuotationLineItem[],
      techStack: updated.techStack,
      termsAndNotes: updated.termsAndNotes,
      status: updated.status as ProjectQuotationRecord["status"],
      sentAt: updated.sentAt ? updated.sentAt.toISOString() : null,
      viewToken: updated.viewToken,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (dbError) {
    const store = ensureLocalStore();
    const index = store.findIndex((q) => q.id === id);
    if (index !== -1) {
      store[index] = {
        ...store[index],
        ...data,
        updatedAt: new Date().toISOString(),
      } as ProjectQuotationRecord;
      writeLocalStore(store);
      return store[index];
    }
    return null;
  }
}

export async function deleteQuotation(id: string): Promise<boolean> {
  try {
    await (prisma as any).projectQuotation.delete({
      where: { id },
    });
    return true;
  } catch (err) {
    const store = ensureLocalStore();
    const filtered = store.filter((q) => q.id !== id);
    if (filtered.length !== store.length) {
      writeLocalStore(filtered);
      return true;
    }
    return false;
  }
}
