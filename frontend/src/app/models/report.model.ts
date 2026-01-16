
export interface Report {
  id: number;
  reporterId: number;
  reporterUsername: string;
  reportedUserId: number;
  reportedUsername: string;
  reportedBlogId?: number;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: number;
}

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export interface CreateUserReportRequest {
  reportedUserId: number;
  reason: string;
}

export interface CreateBlogReportRequest {
  reportedBlogId: number;
  reason: string;
}

export interface ResolveReportRequest {
  status: ReportStatus;
  action?: 'BAN_USER' | 'DELETE_BLOG' | 'WARNING' | 'NONE';
}
