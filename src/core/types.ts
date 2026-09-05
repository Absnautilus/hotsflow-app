export type MembershipStatus = 'invited' | 'active' | 'suspended'
export type PropertyStatus = 'active' | 'suspended'

export interface Property {
  id: string
  organizationId: string
  name: string
  slug: string
  timezone: string
  status: PropertyStatus
  settings: Record<string, unknown>
}

export interface Profile {
  id: string
  fullName: string
  avatarUrl: string | null
}

export interface Membership {
  id: string
  profileId: string
  propertyId: string | null
  organizationId: string | null
  roleId: string
  status: MembershipStatus
}

export interface ModuleEntitlement {
  moduleId: string
  slug: string
  displayName: string
  enabled: boolean
}
