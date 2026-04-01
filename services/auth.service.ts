import bcrypt from 'bcryptjs'
import { usersRepository } from '@/repositories/users.repository'
import { sendEmail } from '@/lib/email'
import { VerifyEmailTemplate } from '@/emails/verify-email'
import { generateToken } from '@/lib/utils/tokens'

export const authService = {
  async register(data: {
    fullName: string
    email: string
    password: string
  }) {
    const existing = await usersRepository.findByEmail(data.email)
    if (existing) throw new Error('An account with this email already exists')

    const passwordHash = await bcrypt.hash(data.password, 12)
    const verificationToken = generateToken()

    const user = await usersRepository.create({
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      verificationToken,
      emailVerified: false,
    })

    const verificationUrl =
      `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`

    await sendEmail({
      to: user.email,
      subject: 'Verify your Permit Portal account',
      template: VerifyEmailTemplate({
        fullName: user.fullName,
        verificationUrl,
      }),
    })

    return user
  },

  async verifyEmail(token: string) {
    const user = await usersRepository.findByVerificationToken(token)
    if (!user) throw new Error('Invalid or expired verification link')
    if (user.emailVerified) throw new Error('Email already verified')

    await usersRepository.update(user.id, {
      emailVerified: true,
      verificationToken: null,
    })

    return user
  },
}