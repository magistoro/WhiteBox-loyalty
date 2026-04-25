import { Global, Module } from "@nestjs/common";
import { MaintenanceStateService } from "./maintenance-state.service";

@Global()
@Module({
  providers: [MaintenanceStateService],
  exports: [MaintenanceStateService],
})
export class MaintenanceModule {}
