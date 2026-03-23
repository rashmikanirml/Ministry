import { RequestType } from "@prisma/client";

export const includeRequestDetails = {
  user: {
    select: {
      id: true,
      name: true,
      username: true,
      division: true,
      role: true,
    },
  },
  toner: true,
  multimedia: true,
  repair: true,
};

export function normalizeRequestType(value: string): RequestType | null {
  const normalized = value.toUpperCase();
  if (
    normalized === RequestType.TONER ||
    normalized === RequestType.MULTIMEDIA ||
    normalized === RequestType.REPAIR
  ) {
    return normalized;
  }
  return null;
}
