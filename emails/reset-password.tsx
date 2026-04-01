import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ResetPasswordTemplateProps {
  fullName: string
  resetUrl: string
}

export function ResetPasswordTemplate({ fullName, resetUrl }: ResetPasswordTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Permit Portal password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Reset your password</Heading>

          <Text style={text}>Hi {fullName},</Text>

          <Text style={text}>
            We received a request to reset the password for your Permit Portal account.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset password
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This link expires in 1 hour. If you did not request a password reset,
            you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 32px',
  maxWidth: '560px',
  borderRadius: '8px',
}

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a1a1a',
  marginBottom: '24px',
}

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#444444',
  margin: '16px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  display: 'inline-block',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const footer = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#9ca3af',
}