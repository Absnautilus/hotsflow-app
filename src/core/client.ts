import { createClient } from '@supabase/supabase-js'
import type { Membership, ModuleEntitlement, Profile, Property } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

function mapProperty(row: Record<string, unknown>): Property {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    name: row.name as string,
    slug: row.slug as string,
    timezone: row.timezone as string,
    status: row.status as Property['status'],
    settings: (row.settings as Record<string, unknown> | null) ?? {},
  }
}

function mapMembership(row: Record<string, unknown>): Membership {
  return {
    id: row.id as string,
    profileId: row.profile_id as string,
    propertyId: (row.property_id as string | null) ?? null,
    organizationId: (row.organization_id as string | null) ?? null,
    roleId: row.role_id as string,
    status: row.status as Membership['status'],
  }
}

export const core = {
  raw: supabase,

  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data, error } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('id', user.id).maybeSingle()
    if (error) throw error
    return data ? { id: data.id, fullName: data.full_name, avatarUrl: data.avatar_url } : null
  },

  async getAccessibleProperties(): Promise<Property[]> {
    const { data, error } = await supabase.from('properties').select('*').order('name')
    if (error) throw error
    return (data ?? []).map((row) => mapProperty(row as Record<string, unknown>))
  },

  async getMembership(propertyId: string): Promise<Membership | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const direct = await supabase.from('memberships').select('*').eq('profile_id', user.id).eq('property_id', propertyId).eq('status', 'active').maybeSingle()
    if (direct.error) throw direct.error
    if (direct.data) return mapMembership(direct.data as Record<string, unknown>)

    const property = await supabase.from('properties').select('organization_id').eq('id', propertyId).maybeSingle()
    if (property.error) throw property.error
    if (!property.data) return null

    const orgWide = await supabase.from('memberships').select('*').eq('profile_id', user.id).eq('organization_id', property.data.organization_id).eq('status', 'active').maybeSingle()
    if (orgWide.error) throw orgWide.error
    return orgWide.data ? mapMembership(orgWide.data as Record<string, unknown>) : null
  },

  async getEnabledModules(propertyId: string): Promise<ModuleEntitlement[]> {
    const { data, error } = await supabase
      .from('property_modules')
      .select('module_id, enabled, modules!inner(slug, display_name)')
      .eq('property_id', propertyId)
      .eq('enabled', true)
    if (error) throw error
    return (data ?? []).map((row) => {
      const module = row.modules as unknown as { slug: string; display_name: string }
      return { moduleId: row.module_id, slug: module.slug, displayName: module.display_name, enabled: row.enabled }
    })
  },

  async hasPermission(propertyId: string, permissionSlug: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('has_permission', { p_property_id: propertyId, p_permission_slug: permissionSlug })
    if (error) throw error
    return data === true
  },
}
