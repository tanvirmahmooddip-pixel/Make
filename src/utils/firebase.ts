import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Customer,
  Product,
  SaleTransaction,
  RepairTicket,
  BranchStockTransfer,
  PendingServiceWork,
  ExpenseRecord,
} from '../types';

// 1. Initialize Firebase App and Firestore with explicit database ID
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 2. Strict Error Handling Enum and Interface per Firebase Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Test Connection on Startup
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is disconnected.');
    } else {
      console.log('Firebase probe completed:', error instanceof Error ? error.message : error);
    }
    return false;
  }
}

// Trigger connection test immediately
testConnection();

// 4. Authentication API
export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

export async function logoutFromFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

export function subscribeAuth(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// 5. Cloud Firestore Document Operations with Mandatory handleFirestoreError
export async function saveCustomerToFirestore(customer: Customer): Promise<void> {
  const path = `customers/${customer.id}`;
  try {
    await setDoc(doc(db, 'customers', customer.id), customer, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCustomerFromFirestore(customerId: string): Promise<void> {
  const path = `customers/${customerId}`;
  try {
    await deleteDoc(doc(db, 'customers', customerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), product, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSaleToFirestore(sale: SaleTransaction): Promise<void> {
  const path = `sales/${sale.id}`;
  try {
    await setDoc(doc(db, 'sales', sale.id), sale, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveRepairToFirestore(repair: RepairTicket): Promise<void> {
  const path = `repairTickets/${repair.id}`;
  try {
    await setDoc(doc(db, 'repairTickets', repair.id), repair, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveBranchTransferToFirestore(transfer: BranchStockTransfer): Promise<void> {
  const path = `branchTransfers/${transfer.id}`;
  try {
    await setDoc(doc(db, 'branchTransfers', transfer.id), transfer, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function savePendingServiceToFirestore(pending: PendingServiceWork): Promise<void> {
  const path = `pendingServices/${pending.id}`;
  try {
    await setDoc(doc(db, 'pendingServices', pending.id), pending, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveExpenseToFirestore(expense: ExpenseRecord): Promise<void> {
  const path = `expenses/${expense.id}`;
  try {
    await setDoc(doc(db, 'expenses', expense.id), expense, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 6. Firestore Real-time Listeners with handleFirestoreError callbacks
export function subscribeToCollection<T>(
  collectionName: string,
  onData: (items: T[]) => void
): Unsubscribe {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as T);
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
    }
  );
}

// 7. Seed Initial Data to Firestore (When User Connects Account)
export async function seedInitialFirestoreData(
  customers: Customer[],
  products: Product[],
  sales: SaleTransaction[],
  repairs: RepairTicket[]
): Promise<void> {
  try {
    // Check if customers already exist to avoid duplicate writes
    const custSnap = await getDocs(collection(db, 'customers'));
    if (custSnap.empty && customers.length > 0) {
      const batch = writeBatch(db);
      customers.forEach((c) => {
        batch.set(doc(db, 'customers', c.id), c);
      });
      products.forEach((p) => {
        batch.set(doc(db, 'products', p.id), p);
      });
      await batch.commit();
      console.log('Initial ERP seed completed to Firebase Firestore.');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'initial_seed');
  }
}
