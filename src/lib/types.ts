// ========================
// Auth & Users
// ========================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roleId: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
  };
}

// ========================
// Projects & BOQ
// ========================

export interface Client {
  id: string;
  name: string;
  commercialName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  crNumber?: string;
  address?: string;
  activityType?: string;
  notes?: string;
  daftraClientId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  startDate?: string;
  endDate?: string;
  managerId?: string;
  manager?: User;
  clientId?: string;
  client?: Client;
  targetRevenue: number;
  estimatedBudget: number;
  daftraCustomerId?: string;
  daftraCostCenterId?: string;
  boqItems?: BOQItem[];
  contracts?: Contract[];
  invoices?: Invoice[];
  purchaseOrders?: PurchaseOrder[];
  expenses?: Expense[];
  createdAt: string;
  updatedAt: string;
}

export interface BOQItem {
  id: string;
  projectId: string;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  executionType: 'SELF' | 'SUBCONTRACT';
  subcontractorPrice?: number;
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  executedQty: number;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  projectId: string;
  parentId?: string;
  name: string;
  startDate?: string;
  endDate?: string;
  completionPercent: number;
  children?: Activity[];
}

// ========================
// Contracts
// ========================

export interface Contract {
  id: string;
  projectId: string;
  project?: Project;
  type: 'MAIN_CONTRACT' | 'SUBCONTRACT';
  subcontractorId?: string;
  subcontractor?: Supplier;
  referenceNumber: string;
  totalValue: number;
  retentionPercent: number;
  advancePayment: number;
  items?: ContractItem[];
  changeOrders?: ChangeOrder[];
  invoices?: Invoice[];
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractItem {
  id: string;
  contractId: string;
  boqItemId: string;
  boqItem?: BOQItem;
  assignedQty: number;
  unitPrice: number;
  totalValue: number;
}

export interface ChangeOrder {
  id: string;
  contractId: string;
  orderNumber: string;
  title: string;
  type: 'ADDITION' | 'DEDUCTION';
  status: 'DRAFT' | 'APPROVED';
  issueDate: string;
  approvedDate?: string;
  amount: number;
  items?: ChangeOrderItem[];
  createdBy?: string;
  approvedBy?: string;
}

export interface ChangeOrderItem {
  id: string;
  changeOrderId: string;
  boqItemId?: string;
  boqItem?: BOQItem;
  description: string;
  quantityChange: number;
  unitPrice: number;
  totalValue: number;
}

// ========================
// Invoices (Mustaqlasat)
// ========================

export interface Invoice {
  id: string;
  projectId: string;
  project?: Project;
  contractId: string;
  contract?: Contract;
  invoiceNumber: string;
  issueDate: string;
  periodStartDate?: string;
  periodEndDate?: string;
  grossAmount: number;
  taxPercent: number;
  taxAmount: number;
  retentionPercent: number;
  retentionAmount: number;
  advanceDeduction: number;
  delayPenalty: number;
  otherDeductions: number;
  deductionTiming: 'BEFORE_VAT' | 'AFTER_VAT';
  deferDeductions: boolean;
  netAmount: number;
  status: 'DRAFT' | 'CERTIFIED' | 'APPROVED';
  daftraInvoiceId?: string;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  paidAmount: number;
  details?: InvoiceDetail[];
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceDetail {
  id: string;
  invoiceId: string;
  boqItemId: string;
  boqItem?: BOQItem;
  previousQty: number;
  currentQty: number;
  totalQty: number;
  unitPrice: number;
  currentValue: number;
}

// ========================
// Procurement & Materials
// ========================

export interface Supplier {
  id: string;
  name: string;
  commercialName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  taxNumber?: string;
  crNumber?: string;
  address?: string;
  activityType?: string;
  notes?: string;
  daftraSupplierId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  description?: string;
  unit: string;
  type: 'MATERIAL' | 'SERVICE' | 'EQUIPMENT';
  defaultPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  projectId: string;
  project?: Project;
  supplierId: string;
  supplier?: Supplier;
  status: 'PENDING' | 'APPROVED' | 'DELIVERED' | 'CANCELLED';
  issueDate: string;
  expectedDate?: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  paidAmount: number;
  daftraId?: string;
  items?: PurchaseOrderItem[];
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  materialId: string;
  material?: Material;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  boqItemId?: string;
  boqItem?: BOQItem;
}

// ========================
// Quotations
// ========================

export interface Quotation {
  id: string;
  quotationNumber: string;
  clientId: string;
  client?: Client;
  title: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  technicalOffer?: string;
  termsConditions?: string;
  totalAmount: number;
  hasVat: boolean;
  vatAmount: number;
  netAmount: number;
  items?: QuotationItem[];
  projectId?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  id: string;
  quotationId: string;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  estimatedUnitCost: number;
}

// ========================
// Expenses
// ========================

export interface Expense {
  id: string;
  expenseNo: string;
  projectId?: string;
  project?: Project;
  description: string;
  category: 'FUEL' | 'FOOD' | 'LOGISTICS' | 'SITE_MATERIALS' | 'OTHER';
  amount: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy?: string;
  isPettyCash: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========================
// Inventory
// ========================

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  projectId?: string;
  project?: Project;
  stocks?: InventoryStock[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStock {
  id: string;
  warehouseId: string;
  warehouse?: Warehouse;
  materialId: string;
  material?: Material;
  quantity: number;
  updatedAt: string;
}

export interface MaterialTransaction {
  id: string;
  referenceNo: string;
  type: 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT';
  date: string;
  warehouseId: string;
  warehouse?: Warehouse;
  materialId: string;
  material?: Material;
  quantity: number;
  poId?: string;
  boqItemId?: string;
  remarks?: string;
  createdBy?: string;
  createdAt: string;
}

// ========================
// Daily Reports
// ========================

export interface DailyReport {
  id: string;
  projectId: string;
  project?: Project;
  reportDate: string;
  weather?: string;
  temperature?: number;
  workPerformed?: string;
  safetyNotes?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  labors?: DailyLabor[];
  equipments?: DailyEquipment[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLabor {
  id: string;
  reportId: string;
  trade: string;
  count: number;
  hours: number;
  notes?: string;
}

export interface DailyEquipment {
  id: string;
  reportId: string;
  equipmentType: string;
  count: number;
  hours: number;
  notes?: string;
}

// ========================
// Settings
// ========================

export interface CompanyProfile {
  id: string;
  nameAr: string;
  nameEn?: string;
  logoUrl?: string;
  stampUrl?: string;
  taxNumber?: string;
  crNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  managerName?: string;
  updatedAt: string;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  technicalOffer?: string;
  termsConditions?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================
// Dashboard Stats
// ========================

export interface DashboardStats {
  totalProjects: number;
  certifiedValue: number;
  totalCosts: number;
  profitMargin: number;
  outstandingRetention: number;
  totalSubcontractors: number;
  chartData: { month: string; revenue: number; cost: number }[];
  recentActivities: { id: string; title: string; subtitle: string; status: string }[];
}
