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
  variant?: "applicant" | "officer";
}

export function PermitSubmittedEmail({
  fullName,
  projectName,
  referenceNumber,
  portalUrl,
  variant = "applicant",
}: PermitSubmittedEmailProps) {
  const isOfficer = variant === "officer";

  return (
    <Html>
      <Head />
      <Preview>
        {isOfficer
          ? `New permit application submitted — ${projectName}`
          : `Permit application received — Ref #${referenceNumber}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            {isOfficer ? "New Permit Application" : "Application Received"}
          </Heading>

          <Text style={paragraph}>
            {isOfficer ? (
              <>
                Hi {fullName}, a new permit application has been submitted and
                requires your attention.
              </>
            ) : (
              <>
                Hi {fullName}, your permit application for{" "}
                <strong>{projectName}</strong> has been successfully submitted.
              </>
            )}
          </Text>

          <Section style={detailsBox}>
            <Text style={detailsLabel}>
              {isOfficer ? "Application details" : "Your reference number"}
            </Text>
            {isOfficer && (
              <Text style={detailsValue}>
                <strong>Project:</strong> {projectName}
              </Text>
            )}
            <Text style={referenceValue}>Ref #{referenceNumber}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={portalUrl}>
              {isOfficer ? "Review application" : "View your application"}
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            {isOfficer
              ? "Log in to the portal to review, assign, or update the status of this application."
              : "You will be notified when your application status is updated."}
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

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f0f9ff",
  border: "1px solid #bae6fd",
  borderRadius: "6px",
  padding: "16px 20px",
  marginBottom: "28px",
};

const detailsLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: "500",
  color: "#0369a1",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  margin: "0 0 4px 0",
};

const detailsValue: React.CSSProperties = {
  fontSize: "16px",
  color: "#0c4a6e",
  margin: "0 0 4px 0",
};

const referenceValue: React.CSSProperties = {
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
