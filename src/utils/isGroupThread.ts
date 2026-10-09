import type { MessageThread } from '../types';

/** More participants than this makes a thread a group chat (staff + client is 2). */
const GROUP_THRESHOLD = 2;

/** True when the thread has more than the two default participants. */
export function isGroupThread(thread: Pick<MessageThread, 'participants'>): boolean {
  return thread.participants.length > GROUP_THRESHOLD;
}
