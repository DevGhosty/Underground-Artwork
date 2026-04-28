import type { ListingStatus } from '../types';

type StatusStampProps = {
  status: ListingStatus;
};

export function StatusStamp({ status }: StatusStampProps) {
  return <span className={`status-stamp status-${status.toLowerCase()}`}>{status}</span>;
}
