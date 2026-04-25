import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ALLOW_DURING_MAINTENANCE_KEY } from "./allow-during-maintenance.decorator";
import { MaintenanceStateService } from "./maintenance-state.service";

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly maintenance: MaintenanceStateService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const allowDuringMaintenance = this.reflector.getAllAndOverride<boolean>(
      ALLOW_DURING_MAINTENANCE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowDuringMaintenance) return true;
    if (!this.maintenance.isMaintenanceActive()) return true;

    const status = this.maintenance.getRestoreStatus();
    throw new ServiceUnavailableException({
      message: "API is temporarily unavailable due to database restore.",
      code: "MAINTENANCE_RESTORE",
      restore: status,
    });
  }
}
