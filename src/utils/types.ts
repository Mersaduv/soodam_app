import { userTypes, adminGroups } from './constants'

// Numeric type for user roles
export type UserRoleType = 
  | typeof userTypes.NormalUser     // 1 - کاربر معمولی
  | typeof userTypes.MemberUser     // 2 - کاربر عضو
  | typeof userTypes.Marketer       // 3 - بازاریاب
  | typeof userTypes.EstateAgent    // 4 - بنگاه املاک
  | typeof adminGroups.SuperAdmin   // 1 - سوپر ادمین
  | typeof adminGroups.Admin        // 2 - ادمین
  | typeof adminGroups.SubscriberUser // 3 - کاربر اشتراکی

// Helper functions for backward compatibility
export const isUserRole = (role: number): boolean => {
  return (
    role === userTypes.NormalUser || 
    role === userTypes.MemberUser || 
    role === userTypes.Marketer || 
    role === userTypes.EstateAgent
  )
}

export const isAdminRole = (role: number): boolean => {
  return (
    role === adminGroups.SuperAdmin || 
    role === adminGroups.Admin || 
    role === adminGroups.SubscriberUser || 
    role === adminGroups.NormalUser
  )
} 