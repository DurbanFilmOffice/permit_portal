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

interface PermitCommentEmailProps {
  recipientName: string;
  commenterName: string;
  commenterRole: string;
  projectName: string;
  referenceNumber: string;
  commentBody: string;
  portalUrl: string;
}

export function PermitCommentEmail({
  recipientName,
  commenterName,
  commenterRole,
  projectName,
  referenceNumber,
  commentBody,
  portalUrl,
}: PermitCommentEmailProps) {
  const roleLabel = formatRole(commenterRole);
  const excerpt =
    commentBody.length > 200 ? `${commentBody.slice(0, 200)}…` : commentBody;

  return (
    <Html>
      <Head />
      <Preview>
        New comment on your application — Ref #{referenceNumber}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Comment</Heading>

          <Text style={paragraph}>
            Hi {recipientName}, <strong>{commenterName}</strong> ({roleLabel})
            has left a comment on your permit application for{" "}
            <strong>{referenceNumber}</strong>.
          </Text>

          <Section style={commentBox}>
            <Text style={commentText}>{excerpt}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={portalUrl}>
              View and reply
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>Ref #{referenceNumber}</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PermitCommentEmail;

// ─── Helpers ──────────────────────────────────────────────

function formatRole(role: string): string {
  switch (role) {
    case "applicant":
      return "Applicant";
    case "permit_officer":
      return "Permit Officer";
    case "permit_admin":
      return "Permit Administrator";
    case "admin":
      return "Administrator";
    case "super_admin":
      return "Super Administrator";
    case "external_user":
      return "External Reviewer";
    default:
      return role
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

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

const commentBox: React.CSSProperties = {
  backgroundColor: "#fafafa",
  border: "1px solid #e4e4e7",
  borderLeft: "3px solid #18181b",
  borderRadius: "4px",
  padding: "14px 18px",
  marginBottom: "28px",
};

const commentText: React.CSSProperties = {
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
