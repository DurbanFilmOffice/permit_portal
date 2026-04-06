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
} from "@react-email/components";

interface InternalNoteNotificationEmailProps {
  recipientName: string;
  authorName: string;
  projectName: string;
  referenceNumber: string;
  noteBody: string;
  portalUrl: string;
}

export function InternalNoteNotificationEmail({
  recipientName,
  authorName,
  projectName,
  referenceNumber,
  noteBody,
  portalUrl,
}: InternalNoteNotificationEmailProps) {
  const excerpt =
    noteBody.length > 200 ? `${noteBody.slice(0, 200)}…` : noteBody;

  return (
    <Html>
      <Head />
      <Preview>
        New internal note — {projectName} Ref #{referenceNumber}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Internal Note</Heading>

          <Text style={paragraph}>
            Hi {recipientName}, <strong>{authorName}</strong> has added an
            internal note to the permit application for{" "}
            <strong>{projectName}</strong>.
          </Text>

          <Section style={noteBox}>
            <Text style={internalLabel}>Internal Only</Text>
            <Text style={noteText}>{excerpt}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={portalUrl}>
              View application
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            This is an internal notification. Do not forward.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default InternalNoteNotificationEmail;

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

const noteBox: React.CSSProperties = {
  backgroundColor: "#fffbeb",
  border: "1px solid #fde68a",
  borderLeft: "3px solid #f59e0b",
  borderRadius: "4px",
  padding: "14px 18px",
  marginBottom: "28px",
};

const internalLabel: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#92400e",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  margin: "0 0 8px 0",
};

const noteText: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#52525b",
  margin: "0",
  fontStyle: "italic",
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
