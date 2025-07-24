import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export class UserService {
  static async updateLastStudyDate(userId) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        lastStudyDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating last study date:", err);
    }
  }

  static async updateStudyStreak(userId, streak) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        studyStreak: streak,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating streak:", err);
    }
  }

  static async logStudySession(userId, sessionData) {
    try {
      const sessionId = `${userId}_${Date.now()}`;
      await updateDoc(doc(db, 'studySessions', sessionId), {
        userId,
        date: serverTimestamp(),
        cardsStudied: sessionData.cardsStudied || 0,
        correctAnswers: sessionData.correctAnswers || 0,
        totalAnswers: sessionData.totalAnswers || 0,
        duration: sessionData.duration || 0,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error logging study session:", err);
    }
  }
}
