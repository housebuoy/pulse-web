// Source of truth for the public legal documents rendered by /legal.
//
// Stored as structured data rather than markdown so the viewer can style
// headings, paragraphs and lists with the app's own type scale (text-h2 /
// text-body / text-fg-muted) instead of pulling in a markdown renderer —
// there isn't one in the dependency tree, and one document viewer doesn't
// justify adding it.
//
// NOTE FOR MAINTAINERS (deliberately not surfaced anywhere in the UI): the
// prose below is written against how Pulse actually behaves — tenant
// isolation (BACKEND_SPEC §2.2), operator metadata-only access (§3.3), the
// 90-day retention line already in the danger-zone card (§8.3), facility
// licensing and the compliance grace period (§4.6), and the "capture and
// show, never advise" clinical scope constraint (§7.5). It is content, not
// code: replace the strings here with the counsel-approved text and
// nothing else in the app has to change.

export type LegalDocSlug = "privacy" | "terms";

export interface LegalSection {
  heading: string;
  /** Each string renders as its own paragraph. */
  body?: string[];
  /** Rendered as a bulleted list after the paragraphs. */
  bullets?: string[];
}

export interface LegalDocument {
  slug: LegalDocSlug;
  title: string;
  /** One-line summary under the title. */
  summary: string;
  /** ISO date — rendered through lib/format.ts, never toLocaleDateString. */
  lastUpdated: string;
  sections: LegalSection[];
}

const PRIVACY: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  summary:
    "How Pulse Health collects, uses, and protects information in the facility workspace.",
  lastUpdated: "2026-09-01",
  sections: [
    {
      heading: "Who this policy covers",
      body: [
        "Pulse Health provides queue management, scheduling, and clinical record-keeping software to healthcare facilities. This policy covers two groups of people: the facility staff who sign in to a Pulse workspace, and the patients whose records a facility keeps in Pulse.",
        "For patient and clinical information, the facility is the data controller and Pulse acts as its processor: the facility decides what is recorded and why, and we handle that information only on its instructions. For staff account information, Pulse is the controller.",
      ],
    },
    {
      heading: "Information we collect",
      bullets: [
        "Staff account information — name, work email, phone number, role, title, department, and profile photo, provided by the facility or by the staff member during account activation.",
        "Facility information — facility name, logo, region, physical address, and the licensing or verification documents submitted when access is requested.",
        "Patient and clinical information — patient demographics and contact details, appointments, queue activity, and clinician-authored records such as visit notes, prescriptions, and laboratory results entered or uploaded by the facility.",
        "Authentication information — password hashes, verification codes, trusted-device markers, and active session records.",
        "Technical information — log data, IP address, browser and device type, and timestamps generated when the workspace is used.",
      ],
    },
    {
      heading: "How we use information",
      bullets: [
        "To operate the workspace: authenticating staff, running queues and appointments, and storing the records a facility creates.",
        "To send operational messages such as verification codes, appointment notifications, and account or security notices.",
        "To secure the service: detecting unauthorized access, investigating abuse, and maintaining audit trails.",
        "To support facilities that contact us, and to diagnose faults they report.",
        "To improve reliability and performance using aggregated, non-identifying usage measurements.",
      ],
    },
    {
      heading: "Clinical content",
      body: [
        "Pulse faithfully records and displays what clinicians write. It does not generate diagnoses, treatment recommendations, triage decisions, or any other clinical advice, and it does not alter clinician-authored content.",
        "Clinical judgement remains entirely with the treating clinician and the facility. Records shown in Pulse reflect what facility staff entered; they are not an independent clinical assessment.",
      ],
    },
    {
      heading: "How information is shared",
      body: [
        "We do not sell personal information, and we do not use patient or clinical information for advertising.",
      ],
      bullets: [
        "Within your facility — staff see information according to the role and permissions the facility administrator assigns.",
        "Never between facilities — each facility's data is isolated, and one facility can never see another facility's patients, staff, or records.",
        "Service providers — vetted infrastructure, hosting, email, and messaging providers who process information on our behalf under contract, and only as needed to run the service.",
        "Legal requirements — where disclosure is required by law, regulation, or valid legal process, or to protect the safety of a person.",
      ],
    },
    {
      heading: "Isolation and internal access",
      body: [
        "Every record in Pulse belongs to exactly one facility, and that boundary is enforced by our servers on every request rather than by the interface alone.",
        "Pulse platform staff administer facility accounts using facility-level metadata such as name, licensing status, plan, and user counts. They cannot browse patient or clinical records, and they cannot sign in as one of your users. Access by our personnel for support or maintenance is limited to what the task requires, logged, and available to the facility on request.",
      ],
    },
    {
      heading: "Data retention",
      body: [
        "We keep information for as long as the facility's workspace is active and it is needed for the purposes described above.",
        "When an account is closed or a deletion request is made, data is held for 90 days under the facility data-retention policy before permanent removal. Nothing is deleted immediately, which gives a facility time to reverse an accidental request. We may retain records for longer where a law, a regulator, or the facility's own medical-records obligations require it.",
      ],
    },
    {
      heading: "Security",
      body: [
        "Information is encrypted in transit. Access is protected by per-account passwords, verification codes on new or unrecognized devices, role-based permissions, and session controls that let staff review and revoke active sessions.",
        "No system is perfectly secure. If a breach affects your information, we will notify the affected facility and the relevant authorities as required by law.",
      ],
    },
    {
      heading: "Your rights and choices",
      body: [
        "Staff can review and update their own profile details from the workspace, and can revoke active sessions at any time.",
        "Patients should direct requests to access, correct, or delete their records to the facility that treats them: the facility holds those records and decides how they are handled. When a facility asks us to act on such a request, we support it.",
      ],
    },
    {
      heading: "Children",
      body: [
        "Pulse is not offered directly to children. Where a facility keeps records for a minor patient, those records are created and managed by the facility under its own consent and guardianship arrangements.",
      ],
    },
    {
      heading: "Changes to this policy",
      body: [
        "We may update this policy as the service changes. The date at the top of this page shows when it was last revised, and material changes will be communicated to facility administrators before they take effect.",
      ],
    },
    {
      heading: "Contact us",
      body: [
        "Questions about this policy, or about how a facility handles information in Pulse, can be sent to privacy@pulsehealth.example. Patients should contact their facility first.",
      ],
    },
  ],
};

const TERMS: LegalDocument = {
  slug: "terms",
  title: "Terms of Service",
  summary:
    "The agreement between Pulse Health and the facilities and staff who use the platform.",
  lastUpdated: "2026-09-01",
  sections: [
    {
      heading: "Agreement to these terms",
      body: [
        "These terms govern access to and use of the Pulse Health platform. By requesting access, activating an account, or signing in, the facility and each of its users agree to them.",
        "Where a facility has signed a separate written agreement with Pulse Health, that agreement takes precedence to the extent the two conflict.",
      ],
    },
    {
      heading: "Who may use Pulse",
      body: [
        "Pulse is provided to licensed healthcare facilities and to the staff those facilities authorize. It is not a consumer service, and accounts are not available to the general public.",
        "Users must be at least 18 years old and must be acting on behalf of the facility that authorized their account.",
      ],
    },
    {
      heading: "Facility accounts and workspaces",
      body: [
        "Each facility receives its own workspace. The facility administrator is responsible for who is invited, what role each staff member holds, and what those roles are permitted to do.",
        "The facility is responsible for the accuracy of the information it provides about itself and for keeping that information current.",
      ],
    },
    {
      heading: "Staff accounts and credentials",
      body: [
        "Accounts are personal and must not be shared. Each staff member is responsible for keeping their password and verification codes confidential, and for activity carried out under their account.",
        "Suspected compromise of an account must be reported to the facility administrator and to Pulse Health without delay.",
      ],
    },
    {
      heading: "Facility verification and licensing",
      body: [
        "Access is granted on the basis that the facility is, and remains, a lawfully operating healthcare provider. We may ask for a valid regulatory licence or supporting documentation before or after a workspace is opened.",
        "Where a workspace is opened before documentation is supplied, it must be provided within the grace period we communicate. A workspace whose documentation is not supplied within that period may be suspended until it is.",
      ],
    },
    {
      heading: "Acceptable use",
      bullets: [
        "Use Pulse only for legitimate healthcare operations at the authorizing facility.",
        "Do not access, or attempt to access, information belonging to another facility or to a patient you have no lawful reason to view.",
        "Do not share, export, or publish patient information except as the facility's own policies and applicable law permit.",
        "Do not probe, scan, disrupt, overload, or reverse engineer the service, or attempt to bypass its access controls.",
        "Do not upload malicious code, or content you have no right to upload.",
      ],
    },
    {
      heading: "Clinical responsibility",
      body: [
        "Pulse is a record-keeping and coordination system. It records and displays what clinicians enter; it does not diagnose, triage, prescribe, or make clinical recommendations, and nothing in the platform should be treated as clinical advice.",
        "All clinical decisions, and responsibility for the accuracy and completeness of clinical records, remain with the treating clinician and the facility. The facility remains responsible for meeting its own medical-records, consent, and data-protection obligations.",
      ],
    },
    {
      heading: "Availability and support",
      body: [
        "We work to keep Pulse available and performing well, and we publish live service health on the system status page. The service is nonetheless provided without a guarantee of uninterrupted availability, and planned maintenance may occasionally interrupt access.",
        "Support is available to facility administrators and staff through the channels listed on our support page.",
      ],
    },
    {
      heading: "Fees",
      body: [
        "Where a facility subscribes to a paid plan, the fees, billing period, and payment terms are set out in that facility's order or written agreement. Fees are payable in advance unless agreed otherwise, and non-payment may lead to suspension after notice.",
      ],
    },
    {
      heading: "Suspension and termination",
      body: [
        "A facility may stop using Pulse at any time. We may suspend or terminate access where these terms are breached, where required by law, where required documentation is not supplied, or where continued use presents a security or safety risk.",
        "After termination, facility data is handled as described in the Privacy Policy, including the 90-day retention period that precedes permanent removal.",
      ],
    },
    {
      heading: "Intellectual property",
      body: [
        "Pulse Health owns the platform, its software, and its branding. Facilities and their staff receive a limited, non-exclusive, non-transferable right to use it for the duration of their access.",
        "The content a facility puts into Pulse — its patient records, clinical notes, and operational data — remains the facility's. We claim no ownership over it.",
      ],
    },
    {
      heading: "Disclaimers and limitation of liability",
      body: [
        "Except where the law does not allow it to be excluded, Pulse is provided as is, without warranties of any kind, including any implied warranty of merchantability or fitness for a particular purpose.",
        "To the fullest extent permitted by law, Pulse Health is not liable for indirect, incidental, or consequential losses, or for loss of profit, revenue, or data. Nothing here limits liability that cannot lawfully be limited, including liability for death or personal injury caused by negligence, or for fraud.",
      ],
    },
    {
      heading: "Changes to these terms",
      body: [
        "We may update these terms as the platform develops. The date at the top of this page shows the current version, and facility administrators will be notified of material changes before they take effect. Continued use after that point means the updated terms are accepted.",
      ],
    },
    {
      heading: "Governing law",
      body: [
        "These terms are governed by the laws of the Republic of Ghana, and the courts of Ghana have jurisdiction over any dispute arising from them.",
      ],
    },
    {
      heading: "Contact",
      body: [
        "Questions about these terms can be sent to legal@pulsehealth.example.",
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS: Record<LegalDocSlug, LegalDocument> = {
  privacy: PRIVACY,
  terms: TERMS,
};

/** Link order for the viewer's document switcher. */
export const LEGAL_DOC_ORDER: LegalDocSlug[] = ["privacy", "terms"];

export function isLegalDocSlug(value: unknown): value is LegalDocSlug {
  return value === "privacy" || value === "terms";
}

/** Falls back to the privacy policy for a missing or unrecognized ?doc=. */
export function resolveLegalDoc(value: unknown): LegalDocument {
  return LEGAL_DOCUMENTS[isLegalDocSlug(value) ? value : "privacy"];
}
