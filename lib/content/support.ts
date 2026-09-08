// Contact channels and FAQ copy for /support.
//
// Kept next to lib/content/legal.ts and for the same reason: it is content,
// not logic, and support details change on a different schedule from the
// screen that renders them. The addresses and numbers below are
// PLACEHOLDERS — swap them for the real desk before launch; the legal
// documents reference privacy@ and legal@ from the same fictional domain.

export interface SupportChannel {
  id: string;
  label: string;
  /** The address/number shown and used as the link target. */
  value: string;
  /** mailto:/tel: href, or null for a channel that isn't clickable. */
  href: string | null;
  /** Availability or expected response time. */
  detail: string;
}

export const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    id: "email",
    label: "Email support",
    value: "support@pulsehealth.example",
    href: "mailto:support@pulsehealth.example",
    detail: "We reply within one business day.",
  },
  {
    id: "phone",
    label: "Phone support",
    value: "+233 30 000 0000",
    href: "tel:+233300000000",
    detail: "Mon-Fri, 8:00-18:00 GMT.",
  },
  {
    id: "urgent",
    label: "Urgent facility issues",
    value: "+233 30 000 0001",
    href: "tel:+233300000001",
    detail: "24/7 for outages affecting patient care.",
  },
];

export interface FaqEntry {
  question: string;
  answer: string;
}

export const SUPPORT_FAQ: FaqEntry[] = [
  {
    question: "I cannot sign in to my workspace.",
    answer:
      "Check that you are using your work email — the same address your facility administrator invited. If your password is not working, use the reset link on the sign-in page. If you are being asked for a verification code you never received, wait for the resend timer and try again, and check your spam folder.",
  },
  {
    question: "How does my facility get a Pulse workspace?",
    answer:
      "Use Request access from the sign-in page. You will be asked for your facility details and a work email, which we verify with a code before the request is submitted. Our team reviews it and emails an approval link that starts the setup.",
  },
  {
    question: "How do I add a doctor or another administrator?",
    answer:
      "Facility administrators invite staff from Staff in the admin workspace. The invited person receives an email to activate their account, set a password, and choose their department. Roles and permissions stay under the administrator's control.",
  },
  {
    question: "A staff member has left the facility. What should we do?",
    answer:
      "An administrator can deactivate the account from the staff record. Access is revoked immediately, while the clinical records that person authored are retained — records are never removed when an account is closed.",
  },
  {
    question: "Who can see our patient records?",
    answer:
      "Only staff at your own facility, according to the permissions your administrator sets. Facilities are isolated from one another, and Pulse platform staff can see facility-level account details only — never patient or clinical records.",
  },
  {
    question: "Is the platform down, or is it just us?",
    answer:
      "Check the system status page for live service health and any open incidents. If everything reads operational and you are still stuck, contact us with your facility name and what you were doing when it failed.",
  },
];
