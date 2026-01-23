import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { ChatMessage } from "@/types/chat";

export class PersistenceService {
  private static COLLECTION_NAME = "memories";
  private static LOCAL_STORAGE_KEY = "celestia_memories_cache";

  static async saveMessage(userId: string, role: "user" | "model", content: string, thoughtSignature?: string): Promise<string> {
    try {
      if (userId !== 'dev-user-local') {
        const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
          userId,
          role,
          content,
          thought_signature: thoughtSignature || null,
          timestamp: serverTimestamp(),
        });
        return docRef.id;
      }
    } catch (error) {
      console.warn("Firestore save failed, falling back to localStorage:", error);
    }

    // Fallback or Dev Mode: Save to localStorage
    const localHistory = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY) || "[]");
    const newMessage: ChatMessage = {
      id: `local-${crypto.randomUUID()}`,
      role: role as any,
      content,
      timestamp: Date.now(),
      thought_signature: thoughtSignature,
    };
    localHistory.push(newMessage);
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(localHistory));
    return newMessage.id;
  }

  static async getHistory(userId: string): Promise<ChatMessage[]> {
    try {
      if (userId !== 'dev-user-local') {
        const q = query(
          collection(db, this.COLLECTION_NAME),
          where("userId", "==", userId),
          orderBy("timestamp", "asc")
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              role: data.role as "user" | "model" | "system",
              content: data.content,
              timestamp: data.timestamp?.toMillis() || Date.now(),
              thought_signature: data.thought_signature,
            };
          });
        }
      }
    } catch (error) {
      console.warn("Firestore history fetch failed, falling back to localStorage:", error);
    }

    // Fallback: Return from localStorage
    return JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY) || "[]");
  }
}
