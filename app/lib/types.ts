export type Role = "ADMIN" | "COACH" | "PLAYER" | "SPECTATOR";
export type BookingType = "TRAINING" | "MATCH";
export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "CONDUCTED";
export type PitchOption = "FULL" | "HALF_A" | "HALF_B";
export type ParticipationStatus = "ATTENDING" | "NOT_ATTENDING";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId: string | null;
  teamName: string | null;
}

export interface BookingWithRelations {
  id: string;
  type: BookingType;
  status: BookingStatus;
  title: string;
  teamId: string;
  team: { id: string; name: string; clubColor: string };
  createdByUserId: string;
  createdBy: { id: string; name: string };
  pitchOption: PitchOption;
  startTime: string;
  endTime: string;
  recurringGroupId: string | null;
  createdAt: string;
  updatedAt: string;
  participations: { userId: string; status: ParticipationStatus; user: { id: string; name: string } }[];
  spectatorInterests: { userId: string }[];
}
