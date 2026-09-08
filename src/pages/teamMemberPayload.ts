import type { MembershipStatus, TeamMember, UpdateTeamMemberInput } from '@hotsflow/core-sdk'

interface FormValues {
  get(name: string): FormDataEntryValue | null
}

export function buildTeamMemberUpdateInput(
  member: TeamMember,
  propertyId: string,
  currentProfileId: string,
  form: FormValues,
): UpdateTeamMemberInput {
  const input: UpdateTeamMemberInput = {
    membershipId: member.membership.id,
    profileId: member.profile.id,
    propertyId,
    jobTitleId: textValue(form, 'job') || null,
    employmentStatus: employmentStatus(form),
  }

  const isSelf = member.profile.id === currentProfileId
  const orgWide = member.membership.propertyId == null
  if (!isSelf && !orgWide) {
    input.roleId = requiredTextValue(form, 'role')
    input.membershipStatus = membershipStatus(form)
  }

  return input
}

function textValue(form: FormValues, name: string): string {
  const value = form.get(name)
  return typeof value === 'string' ? value : ''
}

function requiredTextValue(form: FormValues, name: string): string {
  const value = textValue(form, name)
  if (!value) throw new Error(`missing_${name}`)
  return value
}

function membershipStatus(form: FormValues): MembershipStatus {
  const value = requiredTextValue(form, 'accessStatus')
  if (value !== 'active' && value !== 'invited' && value !== 'suspended') {
    throw new Error('invalid_access_status')
  }
  return value
}

function employmentStatus(form: FormValues): 'active' | 'inactive' {
  const value = requiredTextValue(form, 'employmentStatus')
  if (value !== 'active' && value !== 'inactive') throw new Error('invalid_employment_status')
  return value
}
