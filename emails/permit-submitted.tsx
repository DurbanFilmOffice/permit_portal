import "server-only";

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
} from "@react-email/components";

interface PermitSubmittedEmailProps {
  fullName: string;
  projectName: string;
  referenceNumber: string;
  portalUrl: string;
}

export function PermitSubmittedEmail({
  fullName,
  projectName,
  referenceNumber,
  portalUrl,
}: PermitSubmittedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Permit application received — Ref #{referenceNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Application Received</Heading>

          <Text style={paragraph}>
            Hi {fullName}, your permit application for{" "}
            <strong>{projectName}</strong> has been successfully submitted.
          </Text>

          <Section style={referenceBox}>
            <Text style={referenceLabel}>Your reference number</Text>
            <Text style={referenceNumber_}>Ref #{referenceNumber}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={portalUrl}>
              View your application
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            You will be notified when your application status is updated.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PermitSubmittedEmail;

// ─── Styles ───────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "40px 24px",
  maxWidth: "560px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
};

const heading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#18181b",
  marginBottom: "16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#3f3f46",
  marginBottom: "24px",
};

const referenceBox: React.CSSProperties = {
  backgroundColor: "#f0f9ff",
  border: "1px solid #bae6fd",
  borderRadius: "6px",
  padding: "16px 20px",
  marginBottom: "28px",
};

const referenceLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "500",
  color: "#0369a1",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  margin: "0 0 4px 0",
};

// renamed to avoid collision with the prop
const referenceNumber_: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "700",
  fontFamily: "monospace",
  color: "#0c4a6e",
  margin: "0",
};

const buttonContainer: React.CSSProperties = {
  marginBottom: "28px",
};

const button: React.CSSProperties = {
  backgroundColor: "#18181b",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "500",
  padding: "12px 24px",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-block",
};

const divider: React.CSSProperties = {
  borderColor: "#e4e4e7",
  marginBottom: "20px",
};

const footer: React.CSSProperties = {
  fontSize: "14px",
  color: "#71717a",
  lineHeight: "1.5",
  margin: "0",
};
