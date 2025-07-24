import AsyncStorage from '@react-native-async-storage/async-storage';

import store from '@store/appStore';

import {BackupIntervalString, DEFAULT_BACKUP_INTERVAL, backupIntervalStrings} from '@utils/Time/interfaces';

type BackupReminderState = {
    backupReminderInterval: BackupIntervalString    
}

type BackupReminderActions = 
    | { type: 'UPDATE_REMINDER_INTERVAL', newInterval: BackupIntervalString};

/**
 * Reducer that manages state of backup reminders
 * 
 * @param {BackupReminderState} state - Existing state
 * @param {BackupReminderActions} payload - Action payload
 */
export default function backupReminderReducer(
    state: BackupReminderState = {
        backupReminderInterval: 'Off',
    },
    payload: BackupReminderActions
): BackupReminderState {
    switch (payload.type) {
        case 'UPDATE_REMINDER_INTERVAL':
            return {
                ...state,
                backupReminderInterval: payload.newInterval,
            }
        default:
            return state
    }
}

/**
 * Sets the backup reminder interval in storage.
 * 
 * @param {BackupIntervalString} backupInterval - Backup interval to set
 */
export async function setBackupIntervalInStorage(backupInterval: BackupIntervalString) {
    store.dispatch({ type: 'UPDATE_REMINDER_INTERVAL', newInterval: backupInterval })
    await AsyncStorage.setItem('BackupReminderInterval', backupInterval);
}

/**
 * Gets the backup reminder interval in storage.
 * 
 * @returns {BackupIntervalString} The backup reminder interval
 */
export async function getBackupIntervalInStorage(): Promise<BackupIntervalString> {
  const value = await AsyncStorage.getItem('BackupReminderInterval');

  if (value && backupIntervalStrings.includes(value as BackupIntervalString)) {
    return value as BackupIntervalString;
  }

  return DEFAULT_BACKUP_INTERVAL;
}