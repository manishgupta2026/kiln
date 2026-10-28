export interface InvoiceLineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface BankDetails {
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName?: string | null;
  swiftCode?: string | null;
  upiId?: string | null;
}

export interface ProjectInvoiceRecord {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  clientCompany?: string | null;
  clientAddress?: string | null;
  clientGstin?: string | null;
  projectTitle: string;
  overview?: string | null;
  currency: "INR" | "USD";
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  paymentTerms?: string | null;
  bankDetails?: BankDetails | null;
  notes?: string | null;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  paidAt?: string | null;
  sentAt?: string | null;
  viewToken: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_BANK_DETAILS: BankDetails = {
  accountName: "Digigrantha Studio",
  bankName: "HDFC Bank",
  accountNumber: "50200084920193",
  ifscCode: "HDFC0000240",
  branchName: "Koramangala, Bengaluru",
  swiftCode: "HDFCINBB",
  upiId: "digigrantha@upi",
};
