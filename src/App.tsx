import React, { useState, useEffect } from 'react';
import { AppState, loadAppState, saveAppState } from './utils/storage';
import {
  CurrencyCode,
  LanguageCode,
  Product,
  ProductCategory,
  ProductReturn,
  PurchaseOrder,
  RepairTicket,
  SaleTransaction,
  StoreLocation,
  TelecomBillPayment,
  User,
  UtilityBillPayment,
  ExpenseRecord,
  CCTVCamera,
  SmartDoor,
  CCTVFieldJob,
  BranchStockTransfer,
  PendingServiceWork,
  Customer,
  PaymentMethod,
} from './types';
import { Navbar } from './components/Navbar';
import { NavigationTab, Sidebar } from './components/Sidebar';
import { LiveDashboard } from './components/LiveDashboard';
import { POSModule } from './components/POSModule';
import { InventoryModule } from './components/InventoryModule';
import { CustomerManagementModule } from './components/CustomerManagementModule';
import { RepairsWarrantyModule } from './components/RepairsWarrantyModule';
import { CCTVProtectionModule } from './components/CCTVProtectionModule';
import { CCTVFieldServicesModule } from './components/CCTVFieldServicesModule';
import { UtilityBillsModule } from './components/UtilityBillsModule';
import { TelecomBillsModule } from './components/TelecomBillsModule';
import { ExpensesCashbookModule } from './components/ExpensesCashbookModule';
import { BankLedgerModule } from './components/BankLedgerModule';
import { CostComparisonModule } from './components/CostComparisonModule';
import { PurchaseOrdersModule } from './components/PurchaseOrdersModule';
import { ReturnsPurchasedHistoryModule } from './components/ReturnsPurchasedHistoryModule';
import { InvoicesReceivablesModule } from './components/InvoicesReceivablesModule';
import { DateRangeReportsModule } from './components/DateRangeReportsModule';
import { RabilOwnerPanel } from './components/RabilOwnerPanel';
import { BranchStockTransferModule } from './components/BranchStockTransferModule';
import { OwnerServicesTrackingModule } from './components/OwnerServicesTrackingModule';
import { UniversalCameraBarcodeScanner } from './components/UniversalCameraBarcodeScanner';
import { CashDepositModal } from './components/CashDepositModal';
import { GeminiAIAdvisorModal } from './components/GeminiAIAdvisorModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { BusinessCustomizerModal } from './components/BusinessCustomizerModal';
import { SoftwareInstallationWizardModal } from './components/SoftwareInstallationWizardModal';
import { CompanyConfig } from './types';
import {
  auth,
  loginWithGoogle,
  logoutFromFirebase,
  subscribeAuth,
  subscribeToCollection,
  saveCustomerToFirestore,
  deleteCustomerFromFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveSaleToFirestore,
  saveRepairToFirestore,
  saveBranchTransferToFirestore,
  savePendingServiceToFirestore,
  saveExpenseToFirestore,
  seedInitialFirestoreData,
} from './utils/firebase';
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [invoiceForPrint, setInvoiceForPrint] = useState<SaleTransaction | null>(null);
  const [isGlobalScannerOpen, setIsGlobalScannerOpen] = useState(false);
  const [isBusinessCustomizerOpen, setIsBusinessCustomizerOpen] = useState(false);
  const [isInstallerWizardOpen, setIsInstallerWizardOpen] = useState(false);

  // Firebase Auth and Cloud Sync state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  // Online / Offline Connectivity & Sync
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? (navigator.onLine ?? true) : true);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Light / Dark Theme state (defaulting to light theme as requested)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('al_rabil_erp_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark');
        document.body.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark');
        document.body.classList.remove('light-theme');
      }
      localStorage.setItem('al_rabil_erp_theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncToastMessage('Online: Live sync active with Al-Rabil server');
      setTimeout(() => setSyncToastMessage(null), 3500);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncToastMessage('Offline mode active: Local browser database recording transactions');
      setTimeout(() => setSyncToastMessage(null), 3500);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSyncNow = () => {
    setSyncToastMessage('Syncing local offline cache to cloud server...');
    setTimeout(() => {
      setAppState((prev) => ({
        ...prev,
        offlineQueue: [],
      }));
      setSyncToastMessage('All offline records synchronized successfully!');
      setTimeout(() => setSyncToastMessage(null), 3000);
    }, 1000);
  };

  // Firebase Auth State Listener
  useEffect(() => {
    const unsub = subscribeAuth((user) => {
      setFirebaseUser(user);
      if (user) {
        setSyncToastMessage(`Firebase Cloud: Authenticated as ${user.displayName || user.email}`);
        setTimeout(() => setSyncToastMessage(null), 3500);
      }
    });
    return () => unsub();
  }, []);

  // Real-time Firestore Collection Listeners when User is Authenticated
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubCustomers = subscribeToCollection<Customer>('customers', (cloudCustomers) => {
      if (cloudCustomers && cloudCustomers.length > 0) {
        setAppState((prev) => ({
          ...prev,
          customers: cloudCustomers,
        }));
      }
    });

    const unsubProducts = subscribeToCollection<Product>('products', (cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        setAppState((prev) => ({
          ...prev,
          products: cloudProducts,
        }));
      }
    });

    const unsubSales = subscribeToCollection<SaleTransaction>('sales', (cloudSales) => {
      if (cloudSales && cloudSales.length > 0) {
        setAppState((prev) => ({
          ...prev,
          sales: cloudSales,
        }));
      }
    });

    return () => {
      unsubCustomers();
      unsubProducts();
      unsubSales();
    };
  }, [firebaseUser]);

  const handleGoogleSignIn = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        setSyncToastMessage(`Connected to Firebase: ${user.displayName || user.email}`);
        setTimeout(() => setSyncToastMessage(null), 3000);
      }
    } catch (e) {
      console.error('Google Sign in error:', e);
    }
  };

  const handleFirebaseSignOut = async () => {
    try {
      await logoutFromFirebase();
      setSyncToastMessage('Disconnected from Firebase Cloud');
      setTimeout(() => setSyncToastMessage(null), 3000);
    } catch (e) {
      console.error('Firebase sign out error:', e);
    }
  };

  const handleSyncToCloud = async () => {
    setIsSyncingCloud(true);
    setSyncToastMessage('Syncing ERP data to Firebase Firestore (asia-south1)...');
    try {
      await seedInitialFirestoreData(
        appState.customers,
        appState.products,
        appState.sales,
        appState.repairTickets
      );
      for (const c of appState.customers) {
        await saveCustomerToFirestore(c);
      }
      for (const p of appState.products) {
        await saveProductToFirestore(p);
      }
      setSyncToastMessage('Firebase Cloud Sync Completed! All records backed up.');
      setTimeout(() => setSyncToastMessage(null), 3500);
    } catch (err) {
      console.error('Cloud sync error:', err);
      setSyncToastMessage('Notice: Google sign-in required for cloud database writes.');
      setTimeout(() => setSyncToastMessage(null), 4000);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Cash In Hand calculation
  // Base float 150 + all cash sales + all cash bills + cash repair deposits - cash expenses - cash bank deposits
  const [cashInHand, setCashInHand] = useState<number>(385.450);

  // Save state on updates
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Set document dir for RTL languages (Arabic / Urdu)
  useEffect(() => {
    const isRtl = appState.activeLanguage === 'ar' || appState.activeLanguage === 'ur';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = appState.activeLanguage;
  }, [appState.activeLanguage]);

  const activeUser =
    appState.users.find((u) => u.id === appState.activeUserId) || appState.users[0];

  // Total bank balances
  const totalBankBalance = appState.bankAccounts.reduce(
    (acc, b) => acc + b.currentBalance,
    0
  );

  // Outstanding A/R (Customer Credit)
  const totalReceivables = appState.sales
    .filter((s) => s.status === 'pending' || s.paymentMethod === 'customer_credit')
    .reduce((acc, s) => acc + s.grandTotal, 0);

  // Total Payables
  const totalPayables = appState.purchaseOrders
    .filter((p) => p.paymentStatus !== 'paid')
    .reduce((acc, p) => acc + p.totalAmount, 0);

  // POS Sale Handler
  const handleCompleteSale = (sale: SaleTransaction) => {
    // 1. Decrement product stock
    const updatedProducts = appState.products.map((p) => {
      const soldItem = sale.items.find((item) => item.productId === p.id);
      if (soldItem) {
        return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
      }
      return p;
    });

    // 2. Adjust treasury
    if (sale.paymentMethod === 'cash') {
      setCashInHand((prev) => prev + sale.grandTotal);
    } else if (sale.paymentMethod === 'card') {
      // Credit to NBO POS or Bank Muscat
      setAppState((prev) => ({
        ...prev,
        bankAccounts: prev.bankAccounts.map((b) =>
          b.id === 'bank-nbo-pos' ? { ...b, currentBalance: b.currentBalance + sale.grandTotal } : b
        ),
      }));
    } else if (sale.paymentMethod === 'bank_transfer') {
      // Credit to Bank Muscat
      setAppState((prev) => ({
        ...prev,
        bankAccounts: prev.bankAccounts.map((b) =>
          b.id === 'bank-muscat-corp' ? { ...b, currentBalance: b.currentBalance + sale.grandTotal } : b
        ),
      }));
    }

    setAppState((prev) => ({
      ...prev,
      products: updatedProducts,
      sales: [sale, ...prev.sales],
    }));

    // Cloud Firestore Sync for Sale
    saveSaleToFirestore(sale).catch((err) =>
      console.warn('Firestore sync note for sale:', err)
    );
  };

  // Customer Management Handlers
  const handleAddCustomer = (customer: Customer) => {
    setAppState((prev) => ({
      ...prev,
      customers: [customer, ...prev.customers],
    }));
    saveCustomerToFirestore(customer).catch((err) =>
      console.warn('Firestore sync note for customer:', err)
    );
    setSyncToastMessage(`Customer ${customer.name} added successfully!`);
    setTimeout(() => setSyncToastMessage(null), 3000);
  };

  const handleUpdateCustomer = (customer: Customer) => {
    setAppState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === customer.id ? customer : c)),
    }));
    saveCustomerToFirestore(customer).catch((err) =>
      console.warn('Firestore sync note for customer:', err)
    );
    setSyncToastMessage(`Customer ${customer.name} updated!`);
    setTimeout(() => setSyncToastMessage(null), 3000);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setAppState((prev) => ({
      ...prev,
      customers: prev.customers.filter((c) => c.id !== customerId),
    }));
    deleteCustomerFromFirestore(customerId).catch((err) =>
      console.warn('Firestore sync note for customer delete:', err)
    );
    setSyncToastMessage('Customer record deleted.');
    setTimeout(() => setSyncToastMessage(null), 3000);
  };

  const handleSettleCustomerCredit = (
    customerId: string,
    amount: number,
    method: PaymentMethod,
    note?: string
  ) => {
    const targetCustomer = appState.customers.find((c) => c.id === customerId);
    if (!targetCustomer) return;

    const newCredit = Math.max(0, targetCustomer.creditBalance - amount);
    const updatedCustomer: Customer = {
      ...targetCustomer,
      creditBalance: newCredit,
      notes: note
        ? `${targetCustomer.notes ? targetCustomer.notes + ' | ' : ''}Settled ${amount.toFixed(3)} OMR via ${method}: ${note}`
        : targetCustomer.notes,
    };

    if (method === 'cash') {
      setCashInHand((prev) => prev + amount);
    }

    handleUpdateCustomer(updatedCustomer);
    setSyncToastMessage(`Credit payment of ${amount.toFixed(3)} OMR recorded for ${targetCustomer.name}!`);
    setTimeout(() => setSyncToastMessage(null), 3000);
  };

  // Daily Bank Deposit Handler
  const handleConfirmBankDeposit = (
    bankId: string,
    amount: number,
    slipRef: string,
    notes: string
  ) => {
    setCashInHand((prev) => Math.max(0, prev - amount));
    setAppState((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((b) =>
        b.id === bankId ? { ...b, currentBalance: b.currentBalance + amount } : b
      ),
    }));
  };

  // Smart Door Lock Toggle
  const handleToggleDoorLock = () => {
    setAppState((prev) => {
      const newStatus = prev.smartDoor.status === 'locked' ? 'unlocked' : 'locked';
      const newLog = {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        user: `${activeUser.name} (${newStatus === 'unlocked' ? 'Remote App Unlock' : 'Remote Lock'})`,
        method: 'remote_app' as const,
        status: 'success' as const,
      };

      return {
        ...prev,
        smartDoor: {
          ...prev.smartDoor,
          status: newStatus,
          lastAccessTime: new Date().toISOString(),
          lastAccessedBy: activeUser.name,
          accessLogs: [newLog, ...prev.smartDoor.accessLogs],
        },
      };
    });
  };

  // Camera Status Update
  const handleUpdateCameraStatus = (cameraId: string, status: CCTVCamera['status']) => {
    setAppState((prev) => ({
      ...prev,
      cctvCameras: prev.cctvCameras.map((c) =>
        c.id === cameraId ? { ...c, status } : c
      ),
    }));
  };

  // Utility Bill Payment
  const handleProcessUtilityPayment = (payment: UtilityBillPayment) => {
    if (payment.paymentMethod === 'cash') {
      setCashInHand((prev) => prev + payment.totalCollected);
    }
    setAppState((prev) => ({
      ...prev,
      utilityBills: [payment, ...prev.utilityBills],
    }));
  };

  // Telecom Bill Payment
  const handleProcessTelecomPayment = (payment: TelecomBillPayment) => {
    if (payment.paymentMethod === 'cash') {
      setCashInHand((prev) => prev + payment.amount);
    }
    setAppState((prev) => ({
      ...prev,
      telecomBills: [payment, ...prev.telecomBills],
    }));
  };

  // Add Expense
  const handleAddExpense = (expense: ExpenseRecord) => {
    if (expense.paidFrom === 'cash_drawer') {
      setCashInHand((prev) => Math.max(0, prev - expense.amount));
    } else if (expense.paidFrom === 'bank_muscat') {
      setAppState((prev) => ({
        ...prev,
        bankAccounts: prev.bankAccounts.map((b) =>
          b.id === 'bank-muscat-corp'
            ? { ...b, currentBalance: Math.max(0, b.currentBalance - expense.amount) }
            : b
        ),
      }));
    } else if (expense.paidFrom === 'bank_dhofar') {
      setAppState((prev) => ({
        ...prev,
        bankAccounts: prev.bankAccounts.map((b) =>
          b.id === 'bank-dhofar-biz'
            ? { ...b, currentBalance: Math.max(0, b.currentBalance - expense.amount) }
            : b
        ),
      }));
    }

    setAppState((prev) => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
    }));
    saveExpenseToFirestore(expense).catch((err) =>
      console.warn('Firestore sync note for expense:', err)
    );
  };

  // Transfer Between Banks
  const handleTransferBetweenBanks = (fromBankId: string, toBankId: string, amount: number) => {
    setAppState((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((b) => {
        if (b.id === fromBankId) return { ...b, currentBalance: b.currentBalance - amount };
        if (b.id === toBankId) return { ...b, currentBalance: b.currentBalance + amount };
        return b;
      }),
    }));
  };

  // Process Return & Refund
  const handleProcessReturn = (ret: ProductReturn, restockItems: boolean) => {
    // If restock requested, increment stock
    let updatedProducts = appState.products;
    if (restockItems) {
      updatedProducts = appState.products.map((p) => {
        const item = ret.items.find((i) => i.productId === p.id);
        if (item) return { ...p, stock: p.stock + item.quantity };
        return p;
      });
    }

    // Refund cash from drawer if cash
    if (ret.refundMethod === 'cash') {
      setCashInHand((prev) => Math.max(0, prev - ret.totalRefund));
    }

    setAppState((prev) => ({
      ...prev,
      products: updatedProducts,
      returns: [ret, ...prev.returns],
    }));
  };

  // Mark Invoice as Paid
  const handleMarkInvoicePaid = (invoiceId: string) => {
    const sale = appState.sales.find((s) => s.id === invoiceId);
    if (!sale) return;

    setCashInHand((prev) => prev + sale.grandTotal);
    setAppState((prev) => ({
      ...prev,
      sales: prev.sales.map((s) =>
        s.id === invoiceId
          ? { ...s, status: 'paid', paidAmount: s.grandTotal, balanceDue: 0 }
          : s
      ),
    }));
  };

  // Purchase Order Status Change (when received -> increment inventory stock!)
  const handleUpdatePOStatus = (poId: string, status: PurchaseOrder['status']) => {
    const po = appState.purchaseOrders.find((p) => p.id === poId);
    let updatedProducts = appState.products;

    if (po && status === 'received') {
      updatedProducts = appState.products.map((p) => {
        const orderItem = po.items.find((item) => item.productId === p.id);
        if (orderItem) {
          return { ...p, stock: p.stock + orderItem.quantity };
        }
        return p;
      });
    }

    setAppState((prev) => ({
      ...prev,
      products: updatedProducts,
      purchaseOrders: prev.purchaseOrders.map((p) =>
        p.id === poId ? { ...p, status } : p
      ),
    }));
  };

  // Inter-branch Stock Transfer Handlers
  const handleInitiateTransfer = (transfer: BranchStockTransfer) => {
    setAppState((prev) => {
      // decrement stock for transferred products
      const updatedProducts = prev.products.map((p) => {
        const item = transfer.items.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      });
      return {
        ...prev,
        products: updatedProducts,
        branchTransfers: [transfer, ...prev.branchTransfers],
      };
    });
    saveBranchTransferToFirestore(transfer).catch((err) =>
      console.warn('Firestore transfer sync note:', err)
    );
    setSyncToastMessage(`Stock transfer ${transfer.transferNumber} dispatched in transit.`);
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  const handleReceiveTransfer = (transferId: string) => {
    setAppState((prev) => {
      const updatedTransfers = prev.branchTransfers.map((t) =>
        t.id === transferId
          ? { ...t, status: 'received' as const, receivedBy: activeUser.name }
          : t
      );
      const target = updatedTransfers.find((t) => t.id === transferId);
      if (target) {
        saveBranchTransferToFirestore(target).catch((err) =>
          console.warn('Firestore transfer update note:', err)
        );
      }
      return {
        ...prev,
        branchTransfers: updatedTransfers,
      };
    });
    setSyncToastMessage('Stock transfer officially received and added to branch stock.');
    setTimeout(() => setSyncToastMessage(null), 3500);
  };

  // Owner Services Delay Tracking Handlers
  const handleAddPendingService = (work: PendingServiceWork) => {
    setAppState((prev) => ({
      ...prev,
      pendingServices: [work, ...prev.pendingServices],
    }));
    savePendingServiceToFirestore(work).catch((err) =>
      console.warn('Firestore pending service sync note:', err)
    );
    setSyncToastMessage(`Service delay logged for ${work.referenceCode}`);
    setTimeout(() => setSyncToastMessage(null), 3000);
  };

  const handleUpdatePendingService = (work: PendingServiceWork) => {
    setAppState((prev) => ({
      ...prev,
      pendingServices: prev.pendingServices.map((s) => (s.id === work.id ? work : s)),
    }));
    setSyncToastMessage(`Updated delay reason for ${work.referenceCode}`);
    setTimeout(() => setSyncToastMessage(null), 3000);
  };

  const handleResolvePendingService = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      pendingServices: prev.pendingServices.map((s) =>
        s.id === id ? { ...s, status: 'resolved' as const } : s
      ),
    }));
    setSyncToastMessage('Service delay resolved successfully.');
    setTimeout(() => setSyncToastMessage(null), 3000);
  };

  // Software Installation & Configuration Wizard Handler
  const handleCompleteInstallation = (payload: {
    config: CompanyConfig;
    currency: CurrencyCode;
    language: LanguageCode;
    primaryBranch: Partial<StoreLocation>;
    ownerUser: { name: string; pin: string };
    receiptFormat: 'a4' | 'medium' | 'small';
    deploymentMode: string;
  }) => {
    setAppState((prev) => {
      const updatedBranches = prev.branches.map((b, idx) =>
        idx === 0
          ? {
              ...b,
              ...payload.primaryBranch,
            }
          : b
      );

      const updatedUsers = prev.users.map((u) =>
        u.role === 'owner'
          ? {
              ...u,
              name: payload.ownerUser.name,
              pin: payload.ownerUser.pin,
            }
          : u
      );

      return {
        ...prev,
        companyConfig: payload.config,
        activeCurrency: payload.currency,
        activeLanguage: payload.language,
        branches: updatedBranches,
        users: updatedUsers,
      };
    });

    setSyncToastMessage(
      `Enterprise Software Setup Complete! Deployed: ${payload.config.companyName}`
    );
    setTimeout(() => setSyncToastMessage(null), 5000);
  };

  // Summary data prepared for Gemini AI API
  const aiSummaryData = {
    storeName: appState.companyConfig.companyName,
    activeBranch: appState.branches.find((b) => b.id === appState.activeBranchId)?.name,
    cashInHand,
    totalBankBalance,
    bankAccounts: appState.bankAccounts.map((b) => ({
      bank: b.bankName,
      balance: b.currentBalance,
    })),
    todaySales: appState.sales
      .filter((s) => s.date.startsWith(new Date().toISOString().split('T')[0]))
      .reduce((acc, s) => acc + s.grandTotal, 0),
    totalReceivables,
    totalPayables,
    lowStockCount: appState.products.filter((p) => p.stock <= p.minStockAlert).length,
    activeRepairsCount: appState.repairTickets.filter((r) => r.status !== 'delivered').length,
    activeFieldJobsCount: appState.fieldJobs.filter((j) => j.status !== 'completed').length,
    recentExpenses: appState.expenses.slice(0, 5),
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
        theme === 'light'
          ? 'light-theme bg-slate-50 text-slate-900 selection:bg-amber-200 selection:text-amber-900'
          : 'bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        branches={appState.branches}
        activeBranchId={appState.activeBranchId}
        onSelectBranch={(id) => setAppState((prev) => ({ ...prev, activeBranchId: id }))}
        users={appState.users}
        activeUserId={appState.activeUserId}
        onSelectUser={(id) => setAppState((prev) => ({ ...prev, activeUserId: id }))}
        activeCurrency={appState.activeCurrency}
        onSelectCurrency={(cur) => setAppState((prev) => ({ ...prev, activeCurrency: cur }))}
        activeLanguage={appState.activeLanguage}
        onSelectLanguage={(lang) => setAppState((prev) => ({ ...prev, activeLanguage: lang }))}
        cashInHand={cashInHand}
        totalBankBalance={totalBankBalance}
        isOnline={isOnline}
        pendingOfflineCount={appState.offlineQueue.length}
        onSyncNow={handleSyncNow}
        onOpenScanner={() => setIsGlobalScannerOpen(true)}
        onOpenDepositModal={() => setIsDepositModalOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onQuickSearch={(q) => {
          if (q.trim()) setCurrentTab('pos');
        }}
        isFirebaseConnected={true}
        firebaseUser={firebaseUser}
        onGoogleSignIn={handleGoogleSignIn}
        onFirebaseSignOut={handleFirebaseSignOut}
        onSyncToCloud={handleSyncToCloud}
        isSyncingCloud={isSyncingCloud}
        theme={theme}
        onToggleTheme={toggleTheme}
        companyConfig={appState.companyConfig}
        onOpenBusinessCustomizer={() => setIsBusinessCustomizerOpen(true)}
        onOpenInstallerWizard={() => setIsInstallerWizardOpen(true)}
      />

      {/* Sync Status Toast Banner */}
      {syncToastMessage && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-medium">{syncToastMessage}</span>
          </div>
          <button
            onClick={() => setSyncToastMessage(null)}
            className="text-amber-400 hover:text-white font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-1">
        {/* Nav Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeLanguage={appState.activeLanguage}
          currentUser={activeUser}
          lowStockCount={appState.products.filter((p) => p.stock <= p.minStockAlert).length}
          activeRepairsCount={appState.repairTickets.filter((r) => r.status !== 'delivered').length}
          activeFieldJobsCount={appState.fieldJobs.filter((j) => j.status !== 'completed').length}
          doorLocked={appState.smartDoor.status === 'locked'}
          pendingInvoicesCount={
            appState.sales.filter((s) => s.status === 'pending' || s.paymentMethod === 'customer_credit').length
          }
          onOpenAIModal={() => setIsAIModalOpen(true)}
          companyConfig={appState.companyConfig}
          onOpenBusinessCustomizer={() => setIsBusinessCustomizerOpen(true)}
          onOpenInstallerWizard={() => setIsInstallerWizardOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 p-3 sm:p-4 lg:p-6 pb-20 lg:pb-8 transition-all max-w-[1700px] mx-auto w-full">
          {currentTab === 'dashboard' && (
            <LiveDashboard
              cashInHand={cashInHand}
              bankAccounts={appState.bankAccounts}
              sales={appState.sales}
              products={appState.products}
              repairs={appState.repairTickets}
              fieldJobs={appState.fieldJobs}
              utilityBills={appState.utilityBills}
              telecomBills={appState.telecomBills}
              expenses={appState.expenses}
              smartDoor={appState.smartDoor}
              activeCurrency={appState.activeCurrency}
              onNavigate={setCurrentTab}
              onOpenDepositModal={() => setIsDepositModalOpen(true)}
              onOpenAIModal={() => setIsAIModalOpen(true)}
              onToggleDoorLock={handleToggleDoorLock}
              companyConfig={appState.companyConfig}
              onOpenBusinessCustomizer={() => setIsBusinessCustomizerOpen(true)}
              onOpenInstallerWizard={() => setIsInstallerWizardOpen(true)}
            />
          )}

          {currentTab === 'pos' && (
            <POSModule
              products={appState.products}
              categories={appState.categories}
              currentUser={activeUser}
              activeBranchId={appState.activeBranchId}
              activeCurrency={appState.activeCurrency}
              onCompleteSale={handleCompleteSale}
              onOpenInvoiceModal={(sale) => setInvoiceForPrint(sale)}
              companyConfig={appState.companyConfig}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryModule
              products={appState.products}
              categories={appState.categories}
              currentUser={activeUser}
              activeCurrency={appState.activeCurrency}
              onAddProduct={(p) =>
                setAppState((prev) => ({ ...prev, products: [p, ...prev.products] }))
              }
              onUpdateProduct={(p) =>
                setAppState((prev) => ({
                  ...prev,
                  products: prev.products.map((item) => (item.id === p.id ? p : item)),
                }))
              }
              onDeleteProduct={(id) =>
                setAppState((prev) => ({
                  ...prev,
                  products: prev.products.filter((item) => item.id !== id),
                }))
              }
            />
          )}

          {currentTab === 'customers' && (
            <CustomerManagementModule
              customers={appState.customers}
              sales={appState.sales}
              repairTickets={appState.repairTickets}
              activeCurrency={appState.activeCurrency}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onSettleCredit={handleSettleCustomerCredit}
              onOpenInvoiceModal={(sale) => setInvoiceForPrint(sale)}
            />
          )}

          {currentTab === 'branchTransfer' && (
            <BranchStockTransferModule
              transfers={appState.branchTransfers}
              branches={appState.branches}
              products={appState.products}
              currentUser={activeUser}
              activeCurrency={appState.activeCurrency}
              onInitiateTransfer={handleInitiateTransfer}
              onReceiveTransfer={handleReceiveTransfer}
            />
          )}

          {currentTab === 'repairs' && (
            <RepairsWarrantyModule
              repairs={appState.repairTickets}
              technicians={appState.users.filter(
                (u) => u.role === 'technician' || u.role === 'owner' || u.role === 'manager'
              )}
              currentUser={activeUser}
              activeBranchId={appState.activeBranchId}
              activeCurrency={appState.activeCurrency}
              onAddRepair={(ticket) =>
                setAppState((prev) => ({
                  ...prev,
                  repairTickets: [ticket, ...prev.repairTickets],
                }))
              }
              onUpdateRepair={(ticket) =>
                setAppState((prev) => ({
                  ...prev,
                  repairTickets: prev.repairTickets.map((t) => (t.id === ticket.id ? ticket : t)),
                }))
              }
            />
          )}

          {currentTab === 'pendingBottlenecks' && (
            <OwnerServicesTrackingModule
              pendingServices={appState.pendingServices}
              branches={appState.branches}
              currentUser={activeUser}
              onAddPendingService={handleAddPendingService}
              onUpdatePendingService={handleUpdatePendingService}
              onResolveService={handleResolvePendingService}
            />
          )}

          {currentTab === 'cctvLive' && (
            <CCTVProtectionModule
              cameras={appState.cctvCameras}
              smartDoor={appState.smartDoor}
              currentUser={activeUser}
              onToggleDoorLock={handleToggleDoorLock}
              onUpdateCameraStatus={handleUpdateCameraStatus}
            />
          )}

          {currentTab === 'cctvJobs' && (
            <CCTVFieldServicesModule
              fieldJobs={appState.fieldJobs}
              activeCurrency={appState.activeCurrency}
              onAddJob={(job) =>
                setAppState((prev) => ({ ...prev, fieldJobs: [job, ...prev.fieldJobs] }))
              }
              onUpdateJobStatus={(jobId, status) =>
                setAppState((prev) => ({
                  ...prev,
                  fieldJobs: prev.fieldJobs.map((j) => (j.id === jobId ? { ...j, status } : j)),
                }))
              }
            />
          )}

          {currentTab === 'utilityBills' && (
            <UtilityBillsModule
              utilityBills={appState.utilityBills}
              activeCurrency={appState.activeCurrency}
              onProcessPayment={handleProcessUtilityPayment}
            />
          )}

          {currentTab === 'telecomBills' && (
            <TelecomBillsModule
              telecomBills={appState.telecomBills}
              activeCurrency={appState.activeCurrency}
              onProcessTelecomPayment={handleProcessTelecomPayment}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesCashbookModule
              expenses={appState.expenses}
              cashInHand={cashInHand}
              bankAccounts={appState.bankAccounts}
              currentUser={activeUser}
              activeBranchId={appState.activeBranchId}
              activeCurrency={appState.activeCurrency}
              onAddExpense={handleAddExpense}
              onOpenDepositModal={() => setIsDepositModalOpen(true)}
            />
          )}

          {currentTab === 'bankLedger' && (
            <BankLedgerModule
              bankAccounts={appState.bankAccounts}
              cashInHand={cashInHand}
              totalReceivables={totalReceivables}
              totalPayables={totalPayables}
              activeCurrency={appState.activeCurrency}
              onOpenDepositModal={() => setIsDepositModalOpen(true)}
              onTransferBetweenBanks={handleTransferBetweenBanks}
            />
          )}

          {currentTab === 'costCompare' && (
            <CostComparisonModule activeCurrency={appState.activeCurrency} />
          )}

          {currentTab === 'purchaseOrders' && (
            <PurchaseOrdersModule
              purchaseOrders={appState.purchaseOrders}
              products={appState.products}
              activeCurrency={appState.activeCurrency}
              onAddPO={(po) =>
                setAppState((prev) => ({
                  ...prev,
                  purchaseOrders: [po, ...prev.purchaseOrders],
                }))
              }
              onUpdatePOStatus={handleUpdatePOStatus}
            />
          )}

          {currentTab === 'returns' && (
            <ReturnsPurchasedHistoryModule
              sales={appState.sales}
              returns={appState.returns}
              activeCurrency={appState.activeCurrency}
              onProcessReturn={handleProcessReturn}
              onOpenInvoiceModal={(sale) => setInvoiceForPrint(sale)}
            />
          )}

          {currentTab === 'receivables' && (
            <InvoicesReceivablesModule
              sales={appState.sales}
              activeCurrency={appState.activeCurrency}
              onMarkInvoicePaid={handleMarkInvoicePaid}
              onOpenInvoiceModal={(sale) => setInvoiceForPrint(sale)}
            />
          )}

          {currentTab === 'reports' && (
            <DateRangeReportsModule
              sales={appState.sales}
              expenses={appState.expenses}
              activeCurrency={appState.activeCurrency}
            />
          )}

          {currentTab === 'ownerPanel' && (
            <RabilOwnerPanel
              branches={appState.branches}
              users={appState.users}
              categories={appState.categories}
              companyConfig={appState.companyConfig}
              onAddBranch={(b) =>
                setAppState((prev) => ({ ...prev, branches: [...prev.branches, b] }))
              }
              onUpdateBranch={(b) =>
                setAppState((prev) => ({
                  ...prev,
                  branches: prev.branches.map((item) => (item.id === b.id ? b : item)),
                }))
              }
              onDeleteBranch={(id) =>
                setAppState((prev) => ({
                  ...prev,
                  branches: prev.branches.filter((item) => item.id !== id),
                }))
              }
              onAddUser={(u) =>
                setAppState((prev) => ({ ...prev, users: [...prev.users, u] }))
              }
              onUpdateUser={(u) =>
                setAppState((prev) => ({
                  ...prev,
                  users: prev.users.map((item) => (item.id === u.id ? u : item)),
                }))
              }
              onDeleteUser={(id) =>
                setAppState((prev) => ({
                  ...prev,
                  users: prev.users.filter((item) => item.id !== id),
                }))
              }
              onAddCategory={(c) =>
                setAppState((prev) => ({ ...prev, categories: [...prev.categories, c] }))
              }
              onDeleteCategory={(id) =>
                setAppState((prev) => ({
                  ...prev,
                  categories: prev.categories.filter((item) => item.id !== id),
                }))
              }
              onUpdateCompanyConfig={(cfg) =>
                setAppState((prev) => ({ ...prev, companyConfig: cfg }))
              }
            />
          )}
        </main>
      </div>

      {/* Daily Cash Deposit into Designated Bank Modal */}
      <CashDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        cashInHand={cashInHand}
        bankAccounts={appState.bankAccounts}
        activeCurrency={appState.activeCurrency}
        onConfirmDeposit={handleConfirmBankDeposit}
      />

      {/* Gemini AI Financial & Operational Advisor Modal */}
      <GeminiAIAdvisorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        summaryData={aiSummaryData}
        activeCurrency={appState.activeCurrency}
      />

      {/* Printable Oman VAT 5% Tax Invoice Modal */}
      <InvoicePrintModal
        isOpen={!!invoiceForPrint}
        onClose={() => setInvoiceForPrint(null)}
        sale={invoiceForPrint}
        companyConfig={appState.companyConfig}
        activeCurrency={appState.activeCurrency}
      />

      {/* Global Universal Camera Barcode & IMEI Scanner */}
      <UniversalCameraBarcodeScanner
        isOpen={isGlobalScannerOpen}
        onClose={() => setIsGlobalScannerOpen(false)}
        onScanResult={(code, matched) => {
          if (matched) {
            setSyncToastMessage(`Scanner detected: ${matched.name} (Barcode: ${code})`);
            setCurrentTab('pos');
          } else {
            setSyncToastMessage(`Scanned code: ${code}`);
          }
          setIsGlobalScannerOpen(false);
          setTimeout(() => setSyncToastMessage(null), 4000);
        }}
        products={appState.products}
        title="Universal Camera Barcode & IMEI Scanner"
        subtitle="Works on Android, Apple iOS Safari, Windows, macOS & Linux"
      />

      {/* Universal Business Solution & Company Profile Customizer Modal */}
      <BusinessCustomizerModal
        isOpen={isBusinessCustomizerOpen}
        onClose={() => setIsBusinessCustomizerOpen(false)}
        currentConfig={appState.companyConfig}
        onSaveConfig={(cfg) => {
          setAppState((prev) => ({ ...prev, companyConfig: cfg }));
          setSyncToastMessage(`Branding updated: ${cfg.companyName}`);
          setTimeout(() => setSyncToastMessage(null), 3500);
        }}
      />

      {/* Enterprise Software Installation & Customization Wizard Modal */}
      <SoftwareInstallationWizardModal
        isOpen={isInstallerWizardOpen}
        onClose={() => setIsInstallerWizardOpen(false)}
        currentConfig={appState.companyConfig}
        currentCurrency={appState.activeCurrency}
        currentLanguage={appState.activeLanguage}
        branches={appState.branches}
        currentUser={activeUser}
        onCompleteInstallation={handleCompleteInstallation}
      />

      {/* Mobile Bottom Quick Action Bar for Touchscreens & Phones */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenBusinessCustomizer={() => setIsBusinessCustomizerOpen(true)}
        lowStockCount={appState.products.filter((p) => p.stock <= p.minStockAlert).length}
        pendingInvoicesCount={
          appState.sales.filter((s) => s.status === 'pending' || s.paymentMethod === 'customer_credit').length
        }
      />
    </div>
  );
}
