import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { getRiskGrade } from './utils';

// Types for scan data
export interface ScanData {
  id?: string;
  userId: string;
  text: string;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  red_flags: string[];
  summary: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  createdAt: any; // Firestore timestamp
  detected_keywords?: string[];
  recommendations?: string[];
}

export interface UserStats {
  totalScans: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  averageRiskScore: number;
  lastScanDate: any;
}

/**
 * Save a new scan result to Firestore
 * @param scanData - The complete scan data to save
 * @returns The document ID of the saved scan
 */
export async function saveScanResult(scanData: Omit<ScanData, 'id' | 'createdAt' | 'grade'>): Promise<string | null> {
  try {
    console.log('Saving scan to Firestore:', scanData.userId);
    
    // Always compute grade from score for consistency
    const grade = getRiskGrade(scanData.risk_score);
    
    const scansRef = collection(db, 'scans');
    const docRef = await addDoc(scansRef, {
      ...scanData,
      grade,
      createdAt: serverTimestamp(),
    });
    
    console.log('Scan saved successfully with ID:', docRef.id, 'Grade:', grade);
    return docRef.id;
  } catch (error) {
    console.error('Error saving scan to Firestore:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return null;
  }
}

/**
 * Get all scans for a specific user, sorted by timestamp
 * @param userId - The user's UID
 * @returns Array of scan data
 */
export async function getUserScans(userId: string): Promise<ScanData[]> {
  try {
    console.log('Fetching scans for user:', userId);
    
    const scansRef = collection(db, 'scans');
    const q = query(
      scansRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const scans: ScanData[] = [];
    
    console.log('Found', querySnapshot.size, 'scans');
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      scans.push({
        id: doc.id,
        ...data,
      } as ScanData);
    });
    
    return scans;
  } catch (error) {
    console.error('Error getting user scans:', error);
    
    // If index is missing, try without orderBy
    if (error instanceof Error && error.message.includes('index')) {
      console.log('Index missing, fetching without orderBy...');
      try {
        const scansRef = collection(db, 'scans');
        const q = query(
          scansRef,
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        const scans: ScanData[] = [];
        
        querySnapshot.forEach((doc) => {
          scans.push({
            id: doc.id,
            ...doc.data(),
          } as ScanData);
        });
        
        return scans;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
}

/**
 * Subscribe to user's scans with realtime updates
 * Uses orderBy for proper sorting, with fallback to unordered query
 * @param userId - The user's UID
 * @param callback - Function to call with scans data
 * @returns Unsubscribe function
 */
export function subscribeToUserScans(userId: string, callback: (scans: ScanData[]) => void): () => void {
  let isMounted = true;
  let unsubscribe: (() => void) | null = null;

  const setupSubscription = () => {
    try {
      const scansRef = collection(db, 'scans');
      
      // Try with orderBy first (requires composite index)
      let q;
      try {
        q = query(
          scansRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      } catch (orderError) {
        // If orderBy fails (missing index), use unordered query
        console.log('OrderBy not available, using unordered query');
        q = query(
          scansRef,
          where('userId', '==', userId)
        );
      }
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!isMounted) return;
        
        const scans: ScanData[] = [];
        
        snapshot.forEach((doc) => {
          scans.push({
            id: doc.id,
            ...doc.data(),
          } as ScanData);
        });
        
        callback(scans);
      }, (error) => {
        if (!isMounted) return;
        console.error('Error in realtime subscription:', error);
      });
      
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
    }
  };

  setupSubscription();

  // Return cleanup function
  return () => {
    isMounted = false;
    if (unsubscribe) {
      unsubscribe();
    }
  };
}

/**
 * Get a specific scan by ID
 * @param scanId - The scan document ID
 * @returns The scan data or null if not found
 */
export async function getScanById(scanId: string): Promise<ScanData | null> {
  try {
    const scanRef = doc(db, 'scans', scanId);
    const scanSnap = await getDoc(scanRef);
    
    if (scanSnap.exists()) {
      return {
        id: scanSnap.id,
        ...scanSnap.data(),
      } as ScanData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting scan by ID:', error);
    throw error;
  }
}

/**
 * Delete a scan from Firestore
 * @param scanId - The scan document ID
 * @param userId - The user's UID (for verification)
 * @throws Error if document doesn't exist or user doesn't own it
 */
export async function deleteScan(scanId: string, userId: string): Promise<void> {
  if (!scanId || !userId) {
    throw new Error('Invalid scanId or userId');
  }

  try {
    const scanRef = doc(db, 'scans', scanId);
    const scanSnap = await getDoc(scanRef);
    
    if (!scanSnap.exists()) {
      console.error('Document not found:', scanId);
      throw new Error('Scan not found');
    }
    
    const scanData = scanSnap.data();
    
    // Check if userId field exists and matches
    if (!scanData.userId) {
      console.error('Document has no userId field:', scanId);
      throw new Error('Document has no owner - cannot verify permissions');
    }
    
    if (scanData.userId !== userId) {
      console.error('User mismatch:', { docUserId: scanData.userId, requestUserId: userId });
      throw new Error('Unauthorized: You can only delete your own scans');
    }
    
    // Delete the document
    await deleteDoc(scanRef);
    console.log('Scan deleted successfully:', scanId);
  } catch (error) {
    console.error('Error deleting scan:', error);
    throw error;
  }
}

/**
 * Get user statistics from Firestore
 * @param userId - The user's UID
 * @returns UserStats object
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const scans = await getUserScans(userId);
    
    if (scans.length === 0) {
      return {
        totalScans: 0,
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
        averageRiskScore: 0,
        lastScanDate: null,
      };
    }
    
    const highRiskCount = scans.filter(s => s.risk_level === 'High').length;
    const mediumRiskCount = scans.filter(s => s.risk_level === 'Medium').length;
    const lowRiskCount = scans.filter(s => s.risk_level === 'Low').length;
    
    const totalScore = scans.reduce((sum, scan) => sum + scan.risk_score, 0);
    const averageRiskScore = Math.round(totalScore / scans.length);
    
    // Sort by date to get most recent
    const sortedScans = [...scans].sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    
    return {
      totalScans: scans.length,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      averageRiskScore,
      lastScanDate: sortedScans[0]?.createdAt || null,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
}
