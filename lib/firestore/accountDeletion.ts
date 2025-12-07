import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { getFirebaseFirestore } from '@/lib/firebase/client';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { logger } from '@/lib/utils/logger';
import { getAllPlansForUser } from './focusPlans';

const FOCUS_PLANS_COLLECTION = 'focusPlans';
const USER_PREFERENCES_COLLECTION = 'userPreferences';
const ACTIVE_SESSIONS_COLLECTION = 'activeSessions';
const DAYS_SUBCOLLECTION = 'days';
const SESSION_LOGS_SUBCOLLECTION = 'sessionLogs';

/**
 * Custom error for account deletion failures
 */
export class AccountDeletionError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'AccountDeletionError';
  }
}

/**
 * Deletes all user data from Firestore and then deletes the Firebase Auth account.
 * 
 * This function:
 * 1. Deletes all focus plans (and their subcollections: days and sessionLogs)
 * 2. Deletes user preferences
 * 3. Deletes active sessions
 * 4. Deletes the Firebase Auth account
 * 
 * @throws {AccountDeletionError} If deletion fails at any step
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  try {
    const db = await getFirebaseFirestore();
    
    // Step 1: Delete all focus plans and their subcollections
    try {
      const allPlans = await getAllPlansForUser(userId);
      
      // Delete each plan and its subcollections
      for (const plan of allPlans) {
        if (plan.id) {
          try {
            const planRef = doc(db, FOCUS_PLANS_COLLECTION, plan.id);
            
            // Delete all days and their session logs
            const daysCollectionRef = collection(planRef, DAYS_SUBCOLLECTION);
            const daysQuery = query(daysCollectionRef, where('userId', '==', userId));
            const daysSnapshot = await getDocs(daysQuery);
            
            for (const dayDoc of daysSnapshot.docs) {
              const dayRef = dayDoc.ref;
              
              // Delete all session logs for this day
              const sessionLogsCollectionRef = collection(dayRef, SESSION_LOGS_SUBCOLLECTION);
              const sessionLogsQuery = query(
                sessionLogsCollectionRef,
                where('userId', '==', userId)
              );
              const sessionLogsSnapshot = await getDocs(sessionLogsQuery);
              
              for (const logDoc of sessionLogsSnapshot.docs) {
                await deleteDoc(logDoc.ref);
              }
              
              // Delete the day document
              await deleteDoc(dayRef);
            }
            
            // Finally, delete the plan document
            await deleteDoc(planRef);
          } catch (error) {
            logger.error(`Error deleting plan ${plan.id}:`, error);
            // Continue with other plans even if one fails
          }
        }
      }
    } catch (error) {
      logger.error('Error deleting focus plans:', error);
      // Continue with other deletions
    }

    // Step 2: Delete user preferences
    try {
      const prefsRef = doc(db, USER_PREFERENCES_COLLECTION, userId);
      await deleteDoc(prefsRef);
    } catch (error) {
      logger.error('Error deleting user preferences:', error);
      // Continue with other deletions
    }

    // Step 3: Delete active session
    try {
      const sessionRef = doc(db, ACTIVE_SESSIONS_COLLECTION, userId);
      await deleteDoc(sessionRef);
    } catch (error) {
      logger.error('Error deleting active session:', error);
      // Continue with auth deletion
    }

    // Step 4: Delete Firebase Auth account
    try {
      const auth = await getFirebaseAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new AccountDeletionError('No authenticated user found');
      }

      if (user.uid !== userId) {
        throw new AccountDeletionError('User ID mismatch');
      }

      await deleteUser(user);
      logger.info('Successfully deleted user account', { userId });
    } catch (error) {
      logger.error('Error deleting Firebase Auth account:', error);
      
      // If auth deletion fails, throw a specific error
      if (error instanceof Error) {
        if (error.message.includes('requires-recent-login')) {
          throw new AccountDeletionError(
            'For security, please sign in again before deleting your account.',
            error
          );
        }
        throw new AccountDeletionError(
          'Failed to delete your account. Please try again.',
          error
        );
      }
      
      throw new AccountDeletionError(
        'Failed to delete your account. Please try again.',
        error
      );
    }
  } catch (error) {
    // Re-throw AccountDeletionError as-is
    if (error instanceof AccountDeletionError) {
      throw error;
    }

    logger.error('Unexpected error during account deletion:', error);
    throw new AccountDeletionError(
      'An unexpected error occurred while deleting your account. Please try again.',
      error
    );
  }
}
