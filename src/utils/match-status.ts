import { MATCH_STATUS } from '../validation/matches.js';

export type MatchStatus = typeof MATCH_STATUS[keyof typeof MATCH_STATUS];

export interface MatchLike {
  startTime: string | number | Date;
  endTime: string | number | Date | null | undefined;
  status: MatchStatus;
}

export function getMatchStatus(
  startTime: string | number | Date,
  endTime: string | number | Date | null | undefined,
  now: Date = new Date()
): MatchStatus | null {
  const start = new Date(startTime);
  // Safely check for null/undefined to prevent new Date(null) evaluating to Epoch (1970-01-01)
  if (endTime === null || endTime === undefined) {
    return null;
  }
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (now >= end) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
}

export async function syncMatchStatus(
  match: MatchLike,
  updateStatus: (status: MatchStatus) => void | Promise<void>
): Promise<MatchStatus> {
  const nextStatus = getMatchStatus(match.startTime, match.endTime);
  if (!nextStatus) {
    return match.status;
  }
  if (match.status !== nextStatus) {
    await updateStatus(nextStatus);
    match.status = nextStatus;
  }
  return match.status;
}

