import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser, type RequestUser } from "../auth/decorators/current-user.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { AdminService } from "./admin.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateCompanySubscriptionDto } from "./dto/create-company-subscription.dto";
import { CreateAccountDto } from "./dto/create-account.dto";
import { RequestEmailChangeDto } from "./dto/request-email-change.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateCompanySubscriptionDto } from "./dto/update-company-subscription.dto";
import { UpdateCompanyUserDto } from "./dto/update-company-user.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpsertCompanyProfileDto } from "./dto/upsert-company-profile.dto";

/**
 * Admin-only API surface. Protected by:
 * - `JwtAuthMiddleware` (Bearer JWT, attaches `req.user`, 401 if invalid)
 * - `RolesGuard` + `@Roles(ADMIN)`
 */
@ApiTags("admin")
@ApiBearerAuth("access-token")
@Controller("admin")
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("profile")
  @ApiOperation({ summary: "Example protected admin route" })
  profile(@CurrentUser() user: RequestUser) {
    return {
      scope: "admin",
      user,
    };
  }

  @Post("accounts")
  @ApiOperation({ summary: "Create account with selected role" })
  @ApiBody({ type: CreateAccountDto })
  createAccount(@Body() dto: CreateAccountDto) {
    return this.adminService.createAccount(dto);
  }

  @Get("users")
  @ApiOperation({ summary: "Search users/companies by role, email, name or uuid" })
  @ApiQuery({ name: "role", required: false, enum: UserRole })
  @ApiQuery({ name: "query", required: false, type: String })
  listUsers(@Query("role") role?: UserRole, @Query("query") query?: string) {
    return this.adminService.listUsers(role, query);
  }

  @Patch("users/:uuid/role")
  @ApiOperation({ summary: "Update user role (CLIENT/COMPANY/ADMIN)" })
  @ApiBody({ type: UpdateRoleDto })
  updateUserRole(@Param("uuid") uuid: string, @Body() dto: UpdateRoleDto) {
    return this.adminService.updateUserRole(uuid, dto.role);
  }

  @Get("users/:uuid")
  @ApiOperation({ summary: "Get full user profile and relations by UUID" })
  getUser(@Param("uuid") uuid: string) {
    return this.adminService.getUserByUuid(uuid);
  }

  @Patch("users/:uuid")
  @ApiOperation({ summary: "Update user fields by UUID (admin CRUD)" })
  @ApiBody({ type: UpdateUserDto })
  updateUser(@Param("uuid") uuid: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUserByUuid(uuid, dto);
  }

  @Post("users/:uuid/email-change-request")
  @ApiOperation({ summary: "Send secure email-change confirmation link to new email" })
  @ApiBody({ type: RequestEmailChangeDto })
  requestEmailChange(
    @Param("uuid") uuid: string,
    @Body() dto: RequestEmailChangeDto,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.adminService.requestEmailChange(uuid, actor.userId, dto.newEmail);
  }

  @Delete("users/:uuid")
  @ApiOperation({ summary: "Delete user by UUID" })
  deleteUser(@Param("uuid") uuid: string, @CurrentUser() actor: RequestUser) {
    return this.adminService.deleteUserByUuid(uuid, actor.userId);
  }

  @Post("users/:uuid/reactivate-account")
  @ApiOperation({ summary: "Reactivate frozen account and clear deletion schedule" })
  reactivateUserAccount(@Param("uuid") uuid: string) {
    return this.adminService.reactivateUserAccountByUuid(uuid);
  }

  @Get("subscriptions/stats")
  @ApiOperation({ summary: "Formal subscription statistics" })
  subscriptionStats() {
    return this.adminService.subscriptionStats();
  }

  @Get("subscriptions/:uuid")
  @ApiOperation({ summary: "Find subscription by UUID" })
  findSubscription(@Param("uuid") uuid: string) {
    return this.adminService.findSubscriptionByUuid(uuid);
  }

  @Get("categories")
  @ApiOperation({ summary: "List categories" })
  listCategories() {
    return this.adminService.listCategories();
  }

  @Post("categories")
  @ApiOperation({ summary: "Create category" })
  @ApiBody({ type: CreateCategoryDto })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Patch("categories/:id")
  @ApiOperation({ summary: "Update category" })
  @ApiBody({ type: UpdateCategoryDto })
  updateCategory(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(Number(id), dto);
  }

  @Delete("categories/:id")
  @ApiOperation({ summary: "Delete category" })
  deleteCategory(@Param("id") id: string) {
    return this.adminService.deleteCategory(Number(id));
  }

  @Get("company-users")
  @ApiOperation({ summary: "List company-role users" })
  @ApiQuery({ name: "query", required: false, type: String })
  listCompanyUsers(@Query("query") query?: string) {
    return this.adminService.listCompanyUsers(query);
  }

  @Get("company-users/:uuid")
  @ApiOperation({ summary: "Get company-role user with managed company and subscriptions" })
  getCompanyUser(@Param("uuid") uuid: string) {
    return this.adminService.getCompanyUserByUuid(uuid);
  }

  @Patch("company-users/:uuid")
  @ApiOperation({ summary: "Update company-role user account data" })
  @ApiBody({ type: UpdateCompanyUserDto })
  updateCompanyUser(@Param("uuid") uuid: string, @Body() dto: UpdateCompanyUserDto) {
    return this.adminService.updateCompanyUserByUuid(uuid, dto);
  }

  @Delete("company-users/:uuid")
  @ApiOperation({ summary: "Delete company-role user" })
  deleteCompanyUser(@Param("uuid") uuid: string, @CurrentUser() actor: RequestUser) {
    return this.adminService.deleteCompanyUserByUuid(uuid, actor.userId);
  }

  @Put("company-users/:uuid/company-profile")
  @ApiOperation({ summary: "Create/update company profile for company-role user" })
  @ApiBody({ type: UpsertCompanyProfileDto })
  upsertCompanyProfile(@Param("uuid") uuid: string, @Body() dto: UpsertCompanyProfileDto) {
    return this.adminService.upsertCompanyProfile(uuid, dto);
  }

  @Get("company-users/:uuid/subscriptions")
  @ApiOperation({ summary: "List subscriptions owned by company user" })
  listCompanySubscriptions(@Param("uuid") uuid: string) {
    return this.adminService.listCompanySubscriptions(uuid);
  }

  @Get("company-users/:uuid/clients")
  @ApiOperation({ summary: "List clients linked to this company with loyalty stats" })
  @ApiQuery({ name: "query", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({
    name: "sortBy",
    required: false,
    enum: ["name", "email", "balance", "earned", "spent", "level", "updatedAt"],
  })
  @ApiQuery({ name: "sortDir", required: false, enum: ["asc", "desc"] })
  listCompanyClients(
    @Param("uuid") uuid: string,
    @Query("query") query?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("sortBy")
    sortBy?: "name" | "email" | "balance" | "earned" | "spent" | "level" | "updatedAt",
    @Query("sortDir") sortDir?: "asc" | "desc",
  ) {
    return this.adminService.listCompanyClients(
      uuid,
      query,
      Number(page),
      Number(limit),
      sortBy ?? "updatedAt",
      sortDir ?? "desc",
    );
  }

  @Post("company-users/:uuid/subscriptions")
  @ApiOperation({ summary: "Create subscription for company user (company required)" })
  @ApiBody({ type: CreateCompanySubscriptionDto })
  createCompanySubscription(@Param("uuid") uuid: string, @Body() dto: CreateCompanySubscriptionDto) {
    return this.adminService.createCompanySubscription(uuid, dto);
  }

  @Patch("company-users/:uuid/subscriptions/:subscriptionUuid")
  @ApiOperation({ summary: "Update company subscription" })
  @ApiBody({ type: UpdateCompanySubscriptionDto })
  updateCompanySubscription(
    @Param("uuid") uuid: string,
    @Param("subscriptionUuid") subscriptionUuid: string,
    @Body() dto: UpdateCompanySubscriptionDto,
  ) {
    return this.adminService.updateCompanySubscription(uuid, subscriptionUuid, dto);
  }

  @Delete("company-users/:uuid/subscriptions/:subscriptionUuid")
  @ApiOperation({ summary: "Delete company subscription" })
  deleteCompanySubscription(
    @Param("uuid") uuid: string,
    @Param("subscriptionUuid") subscriptionUuid: string,
  ) {
    return this.adminService.deleteCompanySubscription(uuid, subscriptionUuid);
  }
}
