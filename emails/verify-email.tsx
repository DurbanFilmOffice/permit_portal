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

interface VerifyEmailTemplateProps {
  fullName: string
  verificationUrl: string
}

export function VerifyEmailTemplate({ fullName, verificationUrl }: VerifyEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your Permit Portal account</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>
            Welcome to Permit Portal, {fullName}
          </Heading>
          <Text style={text}>
            Please verify your email address to activate your account.
          </Text>
          <Section style={buttonSection}>
            <Button href={verificationUrl} style={button}>
              Verify email address
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            This link expires in 24 hours. If you did not create an account,
            you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '40px',
  borderRadius: '8px',
  maxWidth: '560px',
}

const heading: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a1a1a',
  marginBottom: '16px',
}

const text: React.CSSProperties = {
  fontSize: '16px',
  color: '#444444',
  lineHeight: '1.5',
  marginBottom: '24px',
}

const buttonSection: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '32px',
}

const button: React.CSSProperties = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
}

const hr: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '0 0 24px',
}

const footer: React.CSSProperties = {
  fontSize: '13px',
  color: '#9ca3af',
  lineHeight: '1.5',
}