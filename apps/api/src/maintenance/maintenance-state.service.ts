import { ConflictException, Injectable } from "@nestjs/common";

export type RestoreStage =
  | "IDLE"
  | "REQUESTED"
  | "READING_SNAPSHOT"
  | "VALIDATING_PAYLOAD"
  | "WAITING_DB_LOCK"
  | "CLEARING_TABLES"
  | "RESTORING_TABLES"
  | "RESETTING_SEQUENCES"
  | "FINALIZING"
  | "DONE"
  | "FAILED";

export type RestoreStatus = {
  active: boolean;
  stage: RestoreStage;
  progressPercent: number;
  message: string;
  backupId: string | null;
  actorLabel: string | null;
  startedAt: string | null;
  updatedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
};

@Injectable()
export class MaintenanceStateService {
  private restoreStatus: RestoreStatus = {
    active: false,
    stage: "IDLE",
    progressPercent: 0,
    message: "System is in normal mode.",
    backupId: null,
    actorLabel: null,
    startedAt: null,
    updatedAt: null,
    finishedAt: null,
    errorMessage: null,
  };

  isMaintenanceActive() {
    return this.restoreStatus.active;
  }

  getRestoreStatus(): RestoreStatus {
    return { ...this.restoreStatus };
  }

  beginRestore(input: { backupId: string; actorLabel: string }) {
    if (this.restoreStatus.active) {
      throw new ConflictException("Another restore is already in progress.");
    }
    const now = new Date().toISOString();
    this.restoreStatus = {
      active: true,
      stage: "REQUESTED",
      progressPercent: 4,
      message: "Restore requested by administrator.",
      backupId: input.backupId,
      actorLabel: input.actorLabel,
      startedAt: now,
      updatedAt: now,
      finishedAt: null,
      errorMessage: null,
    };
  }

  setRestoreStage(input: { stage: RestoreStage; message: string; progressPercent: number }) {
    if (!this.restoreStatus.active) return;
    this.restoreStatus = {
      ...this.restoreStatus,
      stage: input.stage,
      message: input.message,
      progressPercent: Math.max(0, Math.min(100, input.progressPercent)),
      updatedAt: new Date().toISOString(),
    };
  }

  completeRestore(message = "Restore completed successfully.") {
    const now = new Date().toISOString();
    this.restoreStatus = {
      ...this.restoreStatus,
      active: false,
      stage: "DONE",
      progressPercent: 100,
      message,
      updatedAt: now,
      finishedAt: now,
      errorMessage: null,
    };
  }

  failRestore(errorMessage: string) {
    const now = new Date().toISOString();
    this.restoreStatus = {
      ...this.restoreStatus,
      active: false,
      stage: "FAILED",
      progressPercent: 100,
      message: "Restore failed.",
      updatedAt: now,
      finishedAt: now,
      errorMessage,
    };
  }
}
