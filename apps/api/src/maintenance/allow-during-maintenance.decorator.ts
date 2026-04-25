import { SetMetadata } from "@nestjs/common";

export const ALLOW_DURING_MAINTENANCE_KEY = "allowDuringMaintenance";
export const AllowDuringMaintenance = () => SetMetadata(ALLOW_DURING_MAINTENANCE_KEY, true);
