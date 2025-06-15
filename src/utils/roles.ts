import { userTypes, adminGroups } from './constants'

// Map roles to the numeric values from userTypes and adminGroups
export const roles = {
  // User types
  NormalUser: userTypes.NormalUser,        // 1
  MemberUser: userTypes.MemberUser,        // 2
  Marketer: userTypes.Marketer,            // 3
  EstateAgent: userTypes.EstateAgent,      // 4 (used as EstateConsultant in code)
  EstateConsultant: userTypes.EstateAgent, // 4 (alias for EstateAgent)
  
  // Admin groups
  SuperAdmin: adminGroups.SuperAdmin,      // 1
  Admin: adminGroups.Admin,                // 2
  SubscriberUser: adminGroups.SubscriberUser, // 3
  AdminNormalUser: adminGroups.NormalUser, // 4
  
  // For backward compatibility with code using string values
  getNumericValue: (roleString: string): number => {
    if (roleString === 'normalUser') return userTypes.NormalUser;
    if (roleString === 'memberUser') return userTypes.MemberUser;
    if (roleString === 'marketer') return userTypes.Marketer;
    if (roleString === 'estateAgent') return userTypes.EstateAgent;
    if (roleString === 'superAdmin') return adminGroups.SuperAdmin;
    if (roleString === 'admin') return adminGroups.Admin;
    if (roleString === 'subscriber') return adminGroups.SubscriberUser;
    
    return userTypes.NormalUser; // Default
  },
  
  // For backward compatibility with code expecting string values
  getStringValue: (roleNumber: number): string => {
    if (roleNumber === userTypes.NormalUser) return 'normalUser';
    if (roleNumber === userTypes.MemberUser) return 'memberUser';
    if (roleNumber === userTypes.Marketer) return 'marketer';
    if (roleNumber === userTypes.EstateAgent) return 'estateAgent';
    if (roleNumber === adminGroups.SuperAdmin) return 'superAdmin';
    if (roleNumber === adminGroups.Admin) return 'admin';
    if (roleNumber === adminGroups.SubscriberUser) return 'subscriber';
    
    return 'normalUser'; // Default
  }
} 