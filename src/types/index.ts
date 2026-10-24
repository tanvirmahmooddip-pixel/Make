export type CurrencyCode = 'OMR' | 'USD' | 'AED' | 'SAR' | 'EUR' | 'INR';

export type LanguageCode = 'en' | 'ar' | 'bn' | 'ml' | 'ur';

export type UserRoleType = 'owner' | 'manager' | 'technician' | 'cashier' | 'accountant';

export interface UserRolePermissions {
  viewFinancialLedgers: boolean;
  performBankDeposits: boolean;
  editProductCosts: boolean;
  deleteRecords: boolean;
  accessCCTV: boolean;
  issueRefunds: boolean;
  manageUserRoles: boolean;
  accessGeminiAI: boolean;
  manageStoreLocations: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  roleTitle: string;
  avatar: string;
  branchId: string;
  pin: string;
  permissions: UserRolePermissions;
}

export type BusinessIndustry =
  | 'electronics_cctv'
  | 'restaurant_cafe'
  | 'supermarket_grocery'
  | 'general_retail'
  | 'auto_workshop'
  | 'consulting_services'
  | 'custom';

export interface CompanyConfig {
  companyName: string;
  companyNameAr: string;
  shortName: string;
  industryType: BusinessIndustry;
  tagline: string;
  taglineAr: string;
  crNumber: string;
  vatNumber: string;
  taxRatePercent: number;
  taxLabel: string;
  phone: string;
  email: string;
  address: string;
  invoiceFooterNote: string;
  invoiceFooterNoteAr: string;
  currency: CurrencyCode;
}

export interface BusinessPreset {
  id: string;
  name: string;
  industry: BusinessIndustry;
  config: Partial<CompanyConfig>;
  description: string;
  iconName: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  nameAr: string;
  city: string;
  address: string;
  phone: string;
  crNumber: string;
  vatNumber: string;
  isHeadquarters: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  sku: string;
  barcode: string;
  categoryId: string;
  costPrice: number; // In OMR
  sellingPrice: number; // In OMR
  stock: number;
  minStockAlert: number;
  isHousehold: boolean;
  isCCTV: boolean;
  brand: string;
  model?: string;
  warrantyMonths: number;
  image?: string;
  trackIMEI?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  imeiNumbers?: string[];
  customPrice?: number;
  discount: number;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'customer_credit';

export interface SaleTransaction {
  id: string;
  invoiceNumber: string;
  date: string; // ISO
  branchId: string;
  cashierId: string;
  cashierName: string;
  customerName: string;
  customerPhone: string;
  customerVat?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    imeiNumbers?: string[];
    subtotal: number;
  }[];
  subtotal: number;
  taxAmount: number; // 5% Oman VAT
  discountAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    bankName?: string;
    cardLast4?: string;
    authRef?: string;
  };
  paidAmount: number;
  balanceDue: number;
  status: 'paid' | 'partial' | 'pending' | 'returned';
  warrantyUntil?: string;
  notes?: string;
}

export interface RepairTicket {
  id: string;
  ticketNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  imeiOrSerial: string;
  pinOrPattern?: string;
  problemDescription: string;
  physicalConditionNotes: string;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'received' | 'in_diagnosis' | 'waiting_for_parts' | 'in_repair' | 'testing_qa' | 'ready_for_pickup' | 'delivered';
  estimatedCost: number;
  depositPaid: number;
  finalCost: number;
  partsUsed: { name: string; cost: number; price: number }[];
  warrantyDays: number;
  warrantyExpiresAt?: string;
  technicianNotes?: string;
  branchId: string;
}

export interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'motion_detected' | 'night_vision' | 'offline';
  ipAddress: string;
  fps: number;
  resolution: string;
  ptzSupported: boolean;
  streamPlaceholder: string;
}

export interface SmartDoor {
  id: string;
  name: string;
  location: string;
  status: 'locked' | 'unlocked' | 'alarm';
  batteryLevel: number;
  lastAccessTime: string;
  lastAccessedBy: string;
  accessLogs: {
    id: string;
    time: string;
    user: string;
    method: 'rfid_key' | 'pin_code' | 'remote_app' | 'biometric';
    status: 'success' | 'failed_denied';
  }[];
}

export interface CCTVFieldJob {
  id: string;
  jobCode: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  packageType: string;
  scheduledDate: string;
  assignedTechnician: string;
  status: 'scheduled' | 'en_route' | 'in_progress' | 'completed' | 'follow_up';
  equipmentList: string[];
  notes: string;
  price: number;
  amountCollected: number;
}

export interface UtilityBillPayment {
  id: string;
  referenceNumber: string;
  timestamp: string;
  serviceType: 'electricity' | 'water' | 'gas';
  provider: 'nama_supply' | 'medc' | 'diam_water' | 'muscat_gases' | 'national_gas';
  providerName: string;
  accountNumber: string;
  meterNumber?: string;
  customerName: string;
  customerPhone: string;
  billAmount: number;
  commissionFee: number;
  totalCollected: number;
  paymentMethod: PaymentMethod;
  status: 'completed' | 'processing' | 'failed';
  smsNotificationSent: boolean;
}

export interface TelecomBillPayment {
  id: string;
  transactionId: string;
  timestamp: string;
  operator: 'omantel' | 'ooredoo' | 'vodafone' | 'renna' | 'friendi';
  operatorName: string;
  serviceCategory: 'postpaid_bill' | 'prepaid_recharge' | '5g_home_fiber';
  mobileOrAccount: string;
  customerName: string;
  amount: number;
  commission: number;
  paymentMethod: PaymentMethod;
  isAutoPayConfigured: boolean;
  autoPayDayOfMonth?: number;
  status: 'completed' | 'pending';
}

export type ExpenseCategory =
  | 'shop_rent'
  | 'staff_salary'
  | 'utilities'
  | 'tea_hospitality'
  | 'transport_courier'
  | 'moci_baladiya_licenses'
  | 'maintenance_tools'
  | 'marketing_promo'
  | 'misc';

export interface ExpenseRecord {
  id: string;
  date: string;
  category: ExpenseCategory;
  categoryName: string;
  amount: number;
  paidFrom: 'cash_drawer' | 'bank_muscat' | 'bank_dhofar' | 'petty_cash';
  paidTo: string;
  referenceReceipt?: string;
  description: string;
  loggedBy: string;
  branchId: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  currentBalance: number;
  branch: string;
  currency: CurrencyCode;
}

export interface CashInHandReconciliation {
  id: string;
  date: string;
  openingFloat: number;
  cashSalesTotal: number;
  cashBillPaymentsTotal: number;
  cashRepairsTotal: number;
  cashExpensesTotal: number;
  expectedDrawerCash: number;
  actualCountedCash: number;
  variance: number; // positive = over, negative = short
  depositedToBank: {
    bankId: string;
    bankName: string;
    depositAmount: number;
    depositSlipNumber: string;
  } | null;
  reconciledBy: string;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  vendorContact: string;
  orderDate: string;
  expectedDelivery: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    total: number;
  }[];
  totalAmount: number;
  status: 'draft' | 'ordered' | 'received' | 'invoiced' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  invoiceRef?: string;
}

export interface ProductReturn {
  id: string;
  returnNumber: string;
  originalInvoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    refundAmount: number;
    reason: 'defective' | 'wrong_item' | 'customer_regret' | 'warranty_replacement';
    restocked: boolean;
  }[];
  totalRefund: number;
  refundMethod: PaymentMethod;
  processedBy: string;
  notes?: string;
}

export interface BranchStockTransfer {
  id: string;
  transferNumber: string;
  date: string;
  sourceBranchId: string;
  sourceBranchName: string;
  targetBranchId: string;
  targetBranchName: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    barcode: string;
    quantity: number;
  }[];
  status: 'in_transit' | 'received' | 'cancelled';
  transferredBy: string;
  receivedBy?: string;
  notes?: string;
}

export type DelayReasonCode =
  | 'waiting_parts_dubai'
  | 'waiting_customer_approval'
  | 'motherboard_microsoldering'
  | 'customer_unreachable'
  | 'weather_site_access'
  | 'technician_overload'
  | 'other';

export interface PendingServiceWork {
  id: string;
  serviceType: 'mobile_repair' | 'cctv_field_job';
  referenceCode: string;
  customerName: string;
  customerPhone: string;
  deviceOrSite: string;
  assignedPerson: string;
  branchId: string;
  daysPending: number;
  reasonCategory: DelayReasonCode;
  pendingDetailsReason: string;
  supervisorActionNotes?: string;
  priority: 'urgent' | 'high' | 'normal';
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface OfflineQueueItem {
  id: string;
  timestamp: string;
  type: 'sale' | 'repair' | 'expense' | 'transfer';
  description: string;
  payload: any;
  synced: boolean;
}

export interface Customer {
  id: string;
  name: string;
  nameAr?: string;
  phone: string;
  email?: string;
  civilIdOrCr?: string;
  address?: string;
  city: string;
  creditBalance: number;
  creditLimit: number;
  tags: ('vip' | 'wholesale' | 'regular' | 'corporate' | 'credit')[];
  totalPurchasesCount: number;
  totalSpent: number;
  lastPurchaseDate?: string;
  notes?: string;
  createdAt: string;
}

