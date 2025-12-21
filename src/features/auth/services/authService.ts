import { prisma } from '@/lib/prisma'

export async function createUserProfile(userId: string, email: string, name: string) {
  try {
    const profile = await prisma.profile.create({
      data: {
        id: userId,
        email,
        name,
        role: 'USER',
      },
    })
    return { data: profile, error: null }
  } catch (error) {
    console.error('Error creating profile:', error)
    return { data: null, error }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    })
    return profile
  } catch (error) {
    console.error('Error getting profile:', error)
    return null
  }
}
