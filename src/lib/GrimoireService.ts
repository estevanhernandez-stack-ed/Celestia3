import { 
  collection, 
  addDoc, 
  query, 
  where,
  orderBy, 
  getDocs, 
  deleteDoc,
  doc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { GrimoireEntry } from "@/types/grimoire";

export class GrimoireService {
  private static COLLECTION = "v3_grimoire";
  private static LOCAL_STORAGE_KEY = "celestia_grimoire_cache";

  static async saveEntry(userId: string, entry: Omit<GrimoireEntry, 'id' | 'date'>): Promise<string> {
    try {
      if (userId !== 'dev-user-local') {
        const docRef = await addDoc(collection(db, "v3_users", userId, "grimoire"), {
          ...entry,
          date: serverTimestamp(),
        });
        return docRef.id;
      }
    } catch (error) {
      console.warn("Grimoire save failed, falling back to local:", error);
    }

    // Local Fallback
    const local = this.getLocalCache();
    const newEntry: GrimoireEntry = {
      id: `local-${Date.now()}`,
      date: Date.now(),
      ...entry,
    };
    local.push(newEntry);
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(local));
    return newEntry.id;
  }

  static async getEntries(userId: string): Promise<GrimoireEntry[]> {
    try {
      if (userId !== 'dev-user-local') {
        const q = query(
          collection(db, "v3_users", userId, "grimoire"),
          orderBy("date", "desc")
        );

        let snapshot = await getDocs(q);
        
        // Lazy Migration Check: If subcollection is empty, check old global collection
        if (snapshot.empty) {
          const oldQ = query(
            collection(db, this.COLLECTION),
            where("userId", "==", userId)
          );
          const oldSnapshot = await getDocs(oldQ);
          
          if (!oldSnapshot.empty) {
            console.log(`[Migration] Moving ${oldSnapshot.size} entries for user ${userId}`);
            for (const docSnap of oldSnapshot.docs) {
              const data = docSnap.data();
              // Copy to subcollection
              await addDoc(collection(db, "v3_users", userId, "grimoire"), {
                ...data,
                date: data.date || serverTimestamp(),
              });
            }
            // Refresh the new snapshot
            snapshot = await getDocs(q);
          }
        }

        if (!snapshot.empty) {
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toMillis() || Date.now()
          } as GrimoireEntry));
        }
      }
    } catch (error) {
      console.warn("Grimoire fetch failed, using local:", error);
    }

    return this.getLocalCache().sort((a, b) => b.date - a.date);
  }

  static async deleteEntry(userId: string, id: string) {
      // Try Firestore
      try {
          if (!id.startsWith('local-')) {
            await deleteDoc(doc(db, "v3_users", userId, "grimoire", id));
            return;
          }
      } catch (e) {
          console.warn("Delete remote failed", e);
      }

      // Try Local
      const local = this.getLocalCache().filter(e => e.id !== id);
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(local));
  }

  private static getLocalCache(): GrimoireEntry[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY) || "[]");
  }
}
