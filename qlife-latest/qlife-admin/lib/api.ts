import { clearToken, getToken } from "./cognito";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:5012";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the QLife backend with the stored admin ID token and unwraps the
 * `{ data }` envelope. Throws ApiError on non-2xx; a 401 clears the token so
 * the UI can bounce to /login.
 */
export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    clearToken();
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, extractErrorMessage(body, res.status));
  }

  return (body?.data ?? body) as T;
}

/**
 * Pull a human-readable message out of whatever error shape the backend sent.
 * The API wraps errors as `{ error: { message, code, details } }`, but some
 * paths return Nest's `{ message, error }` (string or string[]) — handle both.
 */
function extractErrorMessage(body: unknown, status: number): string {
  const fallback = `Request failed (${status})`;
  if (!body || typeof body !== "object") return fallback;
  const b = body as Record<string, any>;

  const candidates = [b.error?.message, b.error, b.message];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c;
    if (Array.isArray(c) && c.length) return c.join(", ");
  }
  return fallback;
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; pageSize: number; total: number; hasMore: boolean };
}

export interface AdminOverview {
  counts: {
    totalUsers: number;
    activeUsers: number;
    totalProfessionals: number;
    pendingProfessionals: number;
    approvedProfessionals: number;
    totalAppointments: number;
    totalAssessments: number;
    completedAssessments: number;
    totalContentViews: number;
  };
  professionalsByStatus: Record<string, number>;
  professionalsByType: { type: string; count: number }[];
  usersByStatus: Record<string, number>;
  appointmentsByStatus: Record<string, number>;
  signupTrend: {
    weekStart: string;
    label: string;
    users: number;
    professionals: number;
  }[];
}

export interface ProfessionalDetail {
  id: string;
  fullName: string;
  email: string;
  accountId: string;
  accountStatus: string;
  gender: string | null;
  professionType: string;
  designation: string | null;
  bmdcRegistrationNo: string | null;
  graduationBatch: string | null;
  workplace: string | null;
  yearsOfExperience: number | null;
  educationSummary: string | null;
  bio: string | null;
  phone: string | null;
  feeAmount: number | null;
  feeCurrency: string;
  maxWeeklyClients: number | null;
  avgWeeklyClients: number | null;
  timezone: string;
  isVisible: boolean;
  acceptingNewClients: boolean;
  isOnboardingComplete: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  specializations: { name: string; nameBn: string; note: string | null }[];
  availability: { weekday: string; startTime: string | null; endTime: string | null }[];
  caseloads: { locationLabel: string; clientCount: number }[];
  verifications: {
    id: string;
    status: string;
    submittedAt: string;
    reviewedAt: string | null;
    reviewedBy: string | null;
    decisionNote: string | null;
  }[];
  stats: { appointmentCount: number; activeClients: number; assignedAssessments: number };
  recentAppointments: {
    id: string;
    status: string;
    modality: string;
    requestedStartAt: string;
    user: string | null;
  }[];
}

export interface AppointmentDetail {
  id: string;
  status: string;
  modality: string;
  requestedStartAt: string;
  scheduledStartAt: string | null;
  durationMinutes: number | null;
  requestMessage: string | null;
  professionalMessage: string | null;
  meetingLink: string | null;
  profileShareGranted: boolean;
  viewedByProfessionalAt: string | null;
  respondedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  completedAt: string | null;
  createdAt: string;
  user: { accountId: string; displayName: string | null; email: string };
  professional: { id: string; fullName: string; professionType: string };
  careRelationship: { referenceCode: string; status: string } | null;
  events: {
    id: string;
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    actor: { email: string; role: string } | null;
    createdAt: string;
  }[];
}

export interface AssessmentQuestionOption {
  id: string;
  label: string;
  value: number;
  weight: number | null;
  selected: boolean;
}

export interface AssessmentQuestion {
  id: string;
  position: number;
  prompt: string;
  type: string;
  domain: string | null;
  isReverseScored: boolean;
  isRequired: boolean;
  answered: boolean;
  weightApplied: number | null;
  valueNumeric: number | null;
  valueText: string | null;
  options: AssessmentQuestionOption[];
}

export interface AssessmentDetail {
  id: string;
  status: string;
  source: string;
  rawScore: number | null;
  maxScore: number | null;
  normalizedScore: number | null;
  severityLabel: string | null;
  isFromContentFlow: boolean;
  isPostIntervention: boolean;
  assignedAt: string | null;
  dueAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  subject: { accountId: string; displayName: string | null; email: string };
  assignedByProfessional: string | null;
  instrument: { name: string; slug: string; category: string };
  version: {
    versionNumber: number;
    locale: string;
    scoringMethod: string;
    normalizationMax: number | null;
    attribution: string | null;
    instructions: string | null;
  };
  scoringBand: {
    label: string;
    severityRank: number;
    minScore: number | null;
    maxScore: number | null;
    colorHex: string | null;
    advice: string | null;
    recommendedAction: string;
  } | null;
  questions: AssessmentQuestion[];
}
