import type { Context } from "hono"

export type Role = "admin" | "user" | "client"
export type EmployeeRole = "super_admin" | "admin" | "manager" | "employee" | "cashier"
export type LoyaltyTier = "bronze" | "silver" | "gold" | "diamond"
export type StockUnit = "kg" | "g" | "L" | "ml" | "pieces" | "sachets" | "boites"
export type ShowcaseType = "refrigerated" | "frozen" | "heated" | "ambient"
export type LocationType = "refrigerator" | "freezer" | "room" | "shelf" | "other"
export type RewardType = "discount" | "free_item" | "special"
export type TransactionType = "earn" | "redeem" | "bonus" | "adjustment" | "game_win" | "referral" | "mission" | "special_day"
export type MissionType = "visit" | "spend" | "refer" | "birthday" | "review" | "social" | "challenge"
export type GameType = "roulette" | "chichbich"
export type ProductionStatus = "planned" | "in_progress" | "completed" | "cancelled"
export type Gender = "male" | "female" | "other"

export type PermissionKey =
  | "dashboard" | "articles" | "categories" | "suppliers" | "batches"
  | "menu" | "clients" | "clients_loyalty" | "rewards" | "missions"
  | "special_days" | "games" | "referrals" | "pos" | "employees" | "production"

export interface JWTPayload {
  userId: string
  email: string
  role: Role | EmployeeRole
  employeeRole?: EmployeeRole
  permissions?: PermissionKey[]
}

export type AppContext = Context<{ Variables: { user: JWTPayload } }>

export const LOYALTY_CONFIG = {
  pointsPerTND: 1,
  pointsPerTNDReduction: 10,
  sharePoints: 50,
  tierThresholds: {
    bronze: 0,
    silver: 500,
    gold: 1500,
    platinum: 3000,
    diamond: 5000,
  },
} as const