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

interface AssignmentNotificationEmailProps {
  recipientName: string;
  assignedByName: string;
  projectName: string;
  referenceNumber: string;
  permitType: string;
  portalUrl: string;
  note?: string;
}

export default function AssignmentNotificationEmail({
  recipientName,
  assignedByName,
  projectName,
  referenceNumber,
  permitType,
  portalUrl,
  note,
}: AssignmentNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        You have been assigned to a permit application — Ref #{referenceNumber}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Application Assignment</Heading>
          <Hr style={divider} />

          <Text style={paragraph}>Hi {recipientName},</Text>
          <Text style={paragraph}>
            {assignedByName} has assigned you to the following permit
            application.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailRow}>
              <span style={detailLabel}>Project:</span> {projectName}
            </Text>
            <Text style={detailRow}>
              <span style={detailLabel}>Reference:</span>{" "}
              <span style={mono}>Ref #{referenceNumber}</span>
            </Text>
            <Text style={detailRow}>
              <span style={detailLabel}>Type:</span> {permitType}
            </Text>
          </Section>

          {note && (
            <Section style={noteBox}>
              <Text style={noteText}>
                <strong>Note from {assignedByName}:</strong> {note}
              </Text>
            </Section>
          )}

          <Section style={ctaSection}>
            <Button style={button} href={portalUrl}>
              View Application
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            You are receiving this because you have been assigned to review this
            application.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  padding: "40px",
  borderRadius: "8px",
  maxWidth: "560px",
};

const heading: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "600",
  color: "#18181b",
  margin: "0 0 16px",
};

const divider: React.CSSProperties = {
  borderColor: "#e4e4e7",
  margin: "16px 0",
};

const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#3f3f46",
  margin: "0 0 12px",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  border: "1px solid #e4e4e7",
  borderRadius: "6px",
  padding: "16px 20px",
  margin: "20px 0",
};

const detailRow: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#3f3f46",
  margin: "0 0 8px",
};

const detailLabel: React.CSSProperties = {
  fontWeight: "600",
  color: "#18181b",
};

const mono: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "16px",
};

const noteBox: React.CSSProperties = {
  backgroundColor: "#fafafa",
  border: "1px solid #e4e4e7",
  borderLeft: "3px solid #a1a1aa",
  borderRadius: "4px",
  padding: "12px 16px",
  margin: "0 0 20px",
};

const noteText: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#52525b",
  margin: "0",
};

const ctaSection: React.CSSProperties = {
  margin: "24px 0",
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

const footer: React.CSSProperties = {
  fontSize: "14px",
  color: "#a1a1aa",
  margin: "0",
};
