import {
  BankAccount,
  BranchStockTransfer,
  CashInHandReconciliation,
  CCTVCamera,
  CCTVFieldJob,
  CurrencyCode,
  ExpenseRecord,
  LanguageCode,
  OfflineQueueItem,
  PendingServiceWork,
  Product,
  ProductCategory,
  ProductReturn,
  PurchaseOrder,
  RepairTicket,
  SaleTransaction,
  SmartDoor,
  StoreLocation,
  TelecomBillPayment,
  User,
  UtilityBillPayment,
  Customer,
  CompanyConfig,
  BusinessPreset,
  BusinessIndustry,
} from '../types';
import {
  INITIAL_BANK_ACCOUNTS,
  INITIAL_BRANCHES,
  INITIAL_CATEGORIES,
  INITIAL_CCTV_CAMERAS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_FIELD_JOBS,
  INITIAL_PRODUCTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_REPAIR_TICKETS,
  INITIAL_RETURNS,
  INITIAL_SALES,
  INITIAL_SMART_DOOR,
  INITIAL_TELECOM_BILLS,
  INITIAL_USERS,
  INITIAL_UTILITY_BILLS,
} from '../data/initialData';

export type { CompanyConfig } from '../types';

export const BUSINESS_PRESETS: BusinessPreset[] = [
  {
    id: 'preset-rabiul-bigbrother',
    name: 'Rabiul & Big Brother - Mobiles & CCTV Solutions',
    industry: 'electronics_cctv',
    iconName: 'Smartphone',
    description: 'Smartphones, CCTV security surveillance, electronics warranty, and Oman utility bill payments.',
    config: {
      companyName: 'Al-Rabiul & Big Brother Mobiles & Smart Security LLC',
      companyNameAr: 'شركة ربيع والأخ الأكبر للهواتف والأمان الذكي ش.م.م',
      shortName: 'RB',
      industryType: 'electronics_cctv',
      tagline: 'Mobiles • CCTV • Smart Security • Oman Bills',
      taglineAr: 'هواتف • مراقبة • أمان ذكي • سداد فواتير',
      crNumber: 'CR 1394821',
      vatNumber: 'OM1100239102',
      taxRatePercent: 5.0,
      taxLabel: 'Oman VAT (5%)',
      phone: '+968 2478 9120',
      email: 'info@alrabiul-oman.com',
      address: 'Ruwi Commercial High Street, Ruwi, Sultanate of Oman',
      invoiceFooterNote: 'Goods once sold can be exchanged within 7 days with original invoice in sellable condition. 12-month manufacturer warranty on official mobile units.',
      invoiceFooterNoteAr: 'البضاعة المباعة يمكن استبدالها خلال 7 أيام مع الفاتورة الأصلية بحالتها الأصلية. ضمان رسمي لمدة 12 شهر على الهواتف المعتمدة.',
      currency: 'OMR',
    },
  },
  {
    id: 'preset-rst-electronics',
    name: 'RST Electronics & Smart Tech Hub',
    industry: 'electronics_cctv',
    iconName: 'Cpu',
    description: 'Computers, laptops, mobile accessories, CCTV hardware, and precision micro-soldering repairs.',
    config: {
      companyName: 'RST Electronics & Digital Technologies LLC',
      companyNameAr: 'شركة آر إس تي للإلكترونيات والتقنيات الرقمية ش.م.م',
      shortName: 'RST',
      industryType: 'electronics_cctv',
      tagline: 'Electronics • Laptops • Tech Repairs • CCTV Systems',
      taglineAr: 'إلكترونيات • لابتوبات • صيانة هواتف • أنظمة كاميرات',
      crNumber: 'CR 1428900',
      vatNumber: 'OM1100349012',
      taxRatePercent: 5.0,
      taxLabel: 'VAT 5%',
      phone: '+968 2449 8811',
      email: 'support@rstelectronics.com',
      address: 'Al Khuwair Commercial Center, Block 34, Muscat, Oman',
      invoiceFooterNote: 'Official manufacturer warranty covered. Defective accessories eligible for instant swap within 14 days.',
      invoiceFooterNoteAr: 'ضمان المصنع المعتمد مشمول. تبديل فوري للإكسسوارات المعيبة خلال 14 يوماً.',
      currency: 'OMR',
    },
  },
  {
    id: 'preset-bigbro-trading',
    name: 'Big Bro Global Trading & Distribution',
    industry: 'general_retail',
    iconName: 'Building2',
    description: 'Wholesale and retail general commerce, consumer merchandise, import distribution, and store logistics.',
    config: {
      companyName: 'Big Brother Global General Trading LLC',
      companyNameAr: 'شركة الأخ الأكبر للتجارة العامة والتوزيع ش.م.م',
      shortName: 'BIG BRO',
      industryType: 'general_retail',
      tagline: 'Wholesale & Retail Trading • Import-Export Distribution',
      taglineAr: 'تجارة عامة بالجملة والتجزئة • استيراد وتوزيع شامل',
      crNumber: 'CR 1550923',
      vatNumber: 'OM1100499210',
      taxRatePercent: 5.0,
      taxLabel: 'VAT (5%)',
      phone: '+968 2481 0099',
      email: 'orders@bigbrotrading.com',
      address: 'Ghala Industrial Zone, Warehousing Complex #8, Muscat, Oman',
      invoiceFooterNote: 'All commercial deliveries certified under standard trade terms. Claims accepted within 10 business days.',
      invoiceFooterNoteAr: 'جميع الشحنات معتمدة بموجب الشروط التجارية. تقبل الملاحظات خلال 10 أيام عمل.',
      currency: 'OMR',
    },
  },
  {
    id: 'preset-restaurant-cafe',
    name: 'Rabiul Resturent & Cafe House',
    industry: 'restaurant_cafe',
    iconName: 'UtensilsCrossed',
    description: 'Dine-in, takeaway, quick counter POS, kitchen billing, beverage bars, and hospitality management.',
    config: {
      companyName: 'Rabiul Restaurant, Cafe & Fresh Grills',
      companyNameAr: 'مطعم ومقهى ربيع للمأكولات الطازجة والمشاوي',
      shortName: 'RABIUL FOOD',
      industryType: 'restaurant_cafe',
      tagline: 'Delicious Dining • Fresh Grills & Shawarma • Fast Takeaway',
      taglineAr: 'مأكولات شهية • مشاوي طازجة وشاورما • وجبات سريعة وسفري',
      crNumber: 'CR 1678120',
      vatNumber: 'OM1100781290',
      taxRatePercent: 5.0,
      taxLabel: 'Oman VAT 5%',
      phone: '+968 2456 7722',
      email: 'info@rabiul-restaurant.com',
      address: 'Al Seeb Beach Road, Near Fish Market, Seeb, Muscat',
      invoiceFooterNote: 'Thank you for dining with us! Fresh ingredients prepared daily to strict food safety standards.',
      invoiceFooterNoteAr: 'شكراً لاختياركم مطعمنا! مكونات طازجة محضرة يومياً وفق أعلى معايير الجودة الغذائية.',
      currency: 'OMR',
    },
  },
  {
    id: 'preset-supermarket',
    name: 'City Mart Supermarket & Department Store',
    industry: 'supermarket_grocery',
    iconName: 'ShoppingCart',
    description: 'High-speed grocery barcode scanning, fresh food, household goods, multiple checkout cashiers.',
    config: {
      companyName: 'City Mart Supermarket & Hypermarket Co.',
      companyNameAr: 'شركة سيتي مارت للسوبرماركت والهايبرماركت',
      shortName: 'CITY MART',
      industryType: 'supermarket_grocery',
      tagline: 'Fresh Groceries • Daily Essentials • Household & Electronics',
      taglineAr: 'مواد غذائية طازجة • احتياجات يومية • أدوات منزلية وإلكترونيات',
      crNumber: 'CR 1890334',
      vatNumber: 'OM1100662288',
      taxRatePercent: 5.0,
      taxLabel: 'VAT 5%',
      phone: '+968 2412 3456',
      email: 'contact@citymart-oman.com',
      address: 'Mabela South Commercial Avenue, Seeb, Muscat, Oman',
      invoiceFooterNote: 'Exchange permitted within 3 days for non-perishable goods with sales receipt.',
      invoiceFooterNoteAr: 'يسمح بالاستبدال خلال 3 أيام للبضائع غير القابلة للتلف مع إبراز فاتورة الشراء.',
      currency: 'OMR',
    },
  },
  {
    id: 'preset-auto-workshop',
    name: 'Apex Auto Care & Service Workshop',
    industry: 'auto_workshop',
    iconName: 'Wrench',
    description: 'Vehicle maintenance, spare parts inventory, repair job cards, oil change, and fleet servicing.',
    config: {
      companyName: 'Apex Precision Auto Workshop & Parts LLC',
      companyNameAr: 'ورشة أبيكس لخدمات السيارات الدقيقة وقطع الغيار ش.م.م',
      shortName: 'APEX AUTO',
      industryType: 'auto_workshop',
      tagline: 'Auto Diagnostics • Mechanical Repairs • Genuine Spare Parts',
      taglineAr: 'فحص كمبيوتر • ميكانيكا وصيانة شاملة • قطع غيار أصلية',
      crNumber: 'CR 1928374',
      vatNumber: 'OM1100551144',
      taxRatePercent: 5.0,
      taxLabel: 'VAT (5%)',
      phone: '+968 2459 2200',
      email: 'service@apexautocare.com',
      address: 'Wadi Kabir Industrial Area, Street 18, Muscat, Oman',
      invoiceFooterNote: '6-month warranty on workmanship and genuine installed mechanical parts.',
      invoiceFooterNoteAr: 'ضمان لمدة 6 أشهر على أجور اليد وقطع الغيار الميكانيكية الأصلية المركبة.',
      currency: 'OMR',
    },
  },
];


export const INITIAL_BRANCH_TRANSFERS: BranchStockTransfer[] = [
  {
    id: 'tr-01',
    transferNumber: 'TR-OM-2026-081',
    date: '2026-10-06',
    sourceBranchId: 'branch-ruwi',
    sourceBranchName: 'Ruwi High Street (HQ)',
    targetBranchId: 'branch-khoudh',
    targetBranchName: 'Al Khoudh Commercial',
    items: [
      {
        productId: 'prod-iphone16pro-256',
        productName: 'Apple iPhone 16 Pro 256GB - Desert Titanium',
        sku: 'APL-IP16P-256-DES',
        barcode: '195949102938',
        quantity: 2,
      },
      {
        productId: 'prod-anker-65w-gan',
        productName: 'Anker 735 GaNPrime 65W Fast Charger',
        sku: 'ANK-735-65W-UK',
        barcode: '194644083719',
        quantity: 5,
      },
    ],
    status: 'in_transit',
    transferredBy: 'Rabiul & Big Brother (Owners)',
    notes: 'Inter-branch stock rebalance for evening customer reservations.',
  },
];

export const INITIAL_PENDING_SERVICES: PendingServiceWork[] = [
  {
    id: 'ps-01',
    serviceType: 'mobile_repair',
    referenceCode: 'REP-2026-083',
    customerName: 'Bader Al-Qasmi',
    customerPhone: '+968 9456 1234',
    deviceOrSite: 'Xiaomi Redmi Note 12 (Water damaged at Seeb)',
    assignedPerson: 'Salim Al-Maamari (Tech)',
    branchId: 'branch-ruwi',
    daysPending: 3,
    reasonCategory: 'motherboard_microsoldering',
    pendingDetailsReason: 'Main PMIC power IC burned under ultrasonic cleaning; waiting for replacement chip shipment from Dubai.',
    supervisorActionNotes: 'Owner approved DHL express courier for micro-soldering IC chip.',
    priority: 'high',
    status: 'pending',
    createdAt: '2026-10-03',
  },
  {
    id: 'ps-02',
    serviceType: 'cctv_field_job',
    referenceCode: 'CCTV-JOB-102',
    customerName: 'Al-Nahda Trading Hypermarket',
    customerPhone: '+968 9511 2233',
    deviceOrSite: 'Commercial 16-Cam IP NVR System (Barka)',
    assignedPerson: 'Rashid Al-Kindi (Field Tech)',
    branchId: 'branch-ruwi',
    daysPending: 2,
    reasonCategory: 'weather_site_access',
    pendingDetailsReason: 'Customer building exterior scaffold permit delayed by Barka Municipality; waiting for high-ceiling access approval.',
    supervisorActionNotes: 'Manager contacted client facility director to expedite municipal gate pass.',
    priority: 'normal',
    status: 'pending',
    createdAt: '2026-10-04',
  },
  {
    id: 'ps-03',
    serviceType: 'mobile_repair',
    referenceCode: 'REP-2026-079',
    customerName: 'Tariq Al-Fazari',
    customerPhone: '+968 9234 9900',
    deviceOrSite: 'Samsung Galaxy S24 Ultra (No display after drop)',
    assignedPerson: 'Salim Al-Maamari (Tech)',
    branchId: 'branch-ruwi',
    daysPending: 4,
    reasonCategory: 'waiting_customer_approval',
    pendingDetailsReason: 'Screen replacement quote OMR 85.000 sent via SMS; customer phone switched off / not answering WhatsApp calls.',
    supervisorActionNotes: 'Customer contacted on alternate office landline; requested 24 hours to confirm.',
    priority: 'urgent',
    status: 'pending',
    createdAt: '2026-10-02',
  },
];

export interface AppState {
  branches: StoreLocation[];
  activeBranchId: string;
  users: User[];
  activeUserId: string;
  categories: ProductCategory[];
  products: Product[];
  sales: SaleTransaction[];
  repairTickets: RepairTicket[];
  cctvCameras: CCTVCamera[];
  smartDoor: SmartDoor;
  fieldJobs: CCTVFieldJob[];
  utilityBills: UtilityBillPayment[];
  telecomBills: TelecomBillPayment[];
  expenses: ExpenseRecord[];
  bankAccounts: BankAccount[];
  purchaseOrders: PurchaseOrder[];
  returns: ProductReturn[];
  reconciliations: CashInHandReconciliation[];
  branchTransfers: BranchStockTransfer[];
  pendingServices: PendingServiceWork[];
  offlineQueue: OfflineQueueItem[];
  customers: Customer[];
  activeCurrency: CurrencyCode;
  activeLanguage: LanguageCode;
  companyConfig: CompanyConfig;
}

const STORAGE_KEY = 'al_rabil_erp_v2_data';

const DEFAULT_COMPANY_CONFIG: CompanyConfig = {
  companyName: 'Al-Rabiul & Big Brother Mobiles & Smart Security LLC',
  companyNameAr: 'شركة ربيع والأخ الأكبر للهواتف والأمان الذكي ش.م.م',
  shortName: 'RB',
  industryType: 'electronics_cctv',
  tagline: 'Mobiles • CCTV • Smart Security • Oman Bills',
  taglineAr: 'هواتف • مراقبة • أمان ذكي • سداد فواتير',
  crNumber: 'CR 1394821',
  vatNumber: 'OM1100239102',
  taxRatePercent: 5.0,
  taxLabel: 'Oman VAT (5%)',
  phone: '+968 2478 9120',
  email: 'info@alrabiul-oman.com',
  address: 'Ruwi Commercial High Street, Ruwi, Sultanate of Oman',
  invoiceFooterNote: 'Goods once sold can be exchanged within 7 days with original invoice in sellable condition. 12-month manufacturer warranty on official mobile units.',
  invoiceFooterNoteAr: 'البضاعة المباعة يمكن استبدالها خلال 7 أيام مع الفاتورة الأصلية بحالتها الأصلية. ضمان رسمي لمدة 12 شهر على الهواتف المعتمدة.',
  currency: 'OMR',
};

export function getInitialState(): AppState {
  return {
    branches: INITIAL_BRANCHES,
    activeBranchId: INITIAL_BRANCHES[0].id,
    users: INITIAL_USERS,
    activeUserId: INITIAL_USERS[0].id, // Rabiul (Owner)
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    sales: INITIAL_SALES,
    repairTickets: INITIAL_REPAIR_TICKETS,
    cctvCameras: INITIAL_CCTV_CAMERAS,
    smartDoor: INITIAL_SMART_DOOR,
    fieldJobs: INITIAL_FIELD_JOBS,
    utilityBills: INITIAL_UTILITY_BILLS,
    telecomBills: INITIAL_TELECOM_BILLS,
    expenses: INITIAL_EXPENSES,
    bankAccounts: INITIAL_BANK_ACCOUNTS,
    purchaseOrders: INITIAL_PURCHASE_ORDERS,
    returns: INITIAL_RETURNS,
    reconciliations: [],
    branchTransfers: INITIAL_BRANCH_TRANSFERS,
    pendingServices: INITIAL_PENDING_SERVICES,
    offlineQueue: [],
    customers: INITIAL_CUSTOMERS,
    activeCurrency: 'OMR',
    activeLanguage: 'en',
    companyConfig: DEFAULT_COMPANY_CONFIG,
  };
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = getInitialState();
      saveAppState(init);
      return init;
    }
    const parsed = JSON.parse(raw);

    // Ensure Rabiul and Big Brother owners are always present
    const existingUsers = Array.isArray(parsed.users) ? parsed.users : INITIAL_USERS;
    const hasRabiul = existingUsers.some(
      (u: User) => u.name.toLowerCase().includes('rabiul') || u.id === 'user-rabiul-owner'
    );
    const hasBigBrother = existingUsers.some(
      (u: User) => u.name.toLowerCase().includes('big brother') || u.id === 'user-bigbrother-owner'
    );

    let updatedUsers = existingUsers;
    if (!hasRabiul || !hasBigBrother) {
      // Replace old placeholder or insert Rabiul and Big Brother
      const nonOwners = existingUsers.filter((u: User) => u.role !== 'owner');
      updatedUsers = [INITIAL_USERS[0], INITIAL_USERS[1], ...nonOwners];
    }

    const state: AppState = {
      ...getInitialState(),
      ...parsed,
      users: updatedUsers,
      activeUserId: updatedUsers[0].id,
      customers: Array.isArray(parsed.customers) && parsed.customers.length > 0 ? parsed.customers : INITIAL_CUSTOMERS,
      companyConfig: {
        ...DEFAULT_COMPANY_CONFIG,
        ...(parsed.companyConfig || {}),
      },
    };

    saveAppState(state);
    return state;
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
    return getInitialState();
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}
