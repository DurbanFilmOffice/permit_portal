import 'server-only'

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

interface PermitStatusUpdateEmailProps {
  fullName: string
  projectName: string
  referenceNumber: string
  newStatus: string
  reason?: string
  portalUrl: string
}

export function PermitStatusUpdateEmail({
  fullName,
  projectName,
  referenceNumber,
  newStatus,
  reason,
  portalUrl,
}: PermitStatusUpdateEmailProps) {
  const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
  const headingColor = getHeadingColor(newStatus)
  const isReturned = newStatus === 'returned'

  return (
    <Html>
      <Head />
      <Preview>Application {newStatus} — Ref #{referenceNumber}</Preview>
      <Body style={main}>
        <Container style={container}>

          <Heading style={{ ...heading, color: headingColor }}>
            Application {statusLabel}
          </Heading>

          <Text style={paragraph}>
            Hi {fullName}, your permit application for{' '}
            <strong>{projectName}</strong> (Ref #{referenceNumber}) has been{' '}
            {newStatus}.
          </Text>

          {reason && (
            <Section style={reasonBox}>
              <Text style={reasonText}>
                <strong>Reason:</strong> {reason}
              </Text>
            </Section>
          )}

          <Section style={buttonContainer}>
            <Button style={button} href={portalUrl}>
              View your application
            </Button>
          </Section>

          {isReturned && (
            <>
              <Hr style={divider} />
              <Text style={footer}>
                Please review the feedback and resubmit your application.
              </Text>
            </>
          )}

        </Container>
      </Body>
    </Html>
  )
}

export default PermitStatusUpdateEmail

// ─── Helpers ──────────────────────────────────────────────

function getHeadingColor(status: string): string {
  switch (status) {
    case 'approved': return '#16a34a'
    case 'rejected': return '#dc2626'
    case 'returned': return '#d97706'
    default:         return '#18181b'
  }
}

// ─── Styles ───────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: '40px 24px',
  maxWidth: '560px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
}

const heading: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '600',
  marginBottom: '16px',
}

const paragraph: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#3f3f46',
  marginBottom: '24px',
}

const reasonBox: React.CSSProperties = {
  backgroundColor: '#fafafa',
  border: '1px solid #e4e4e7',
  borderLeft: '3px solid #a1a1aa',
  borderRadius: '4px',
  padding: '14px 18px',
  marginBottom: '24px',
}

const reasonText: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#52525b',
  margin: '0',
}

const buttonContainer: React.CSSProperties = {
  marginBottom: '28px',
}

const button: React.CSSProperties = {
  backgroundColor: '#18181b',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '500',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
}

const divider: React.CSSProperties = {
  borderColor: '#e4e4e7',
  marginBottom: '20px',
}

const footer: React.CSSProperties = {
  fontSize: '14px',
  color: '#71717a',
  lineHeight: '1.5',
  margin: '0',
}