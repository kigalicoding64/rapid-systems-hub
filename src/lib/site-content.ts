// Static marketing content for the public website. Company facts (contact details,
// vision, mission) live in the editable company_settings table, not here.
import securityImg from "@/assets/service-security.jpg";
import fireImg from "@/assets/service-fire.jpg";
import avImg from "@/assets/service-av.jpg";
import smartImg from "@/assets/service-smart.jpg";

export const DIVISION_SLUGS = [
  "security-systems",
  "fire-life-safety",
  "audio-visual",
  "smart-buildings-ict",
  "electrical-plumbing",
  "iptv-signage",
] as const;
export type DivisionSlug = (typeof DIVISION_SLUGS)[number];

export function isDivisionSlug(value: unknown): value is DivisionSlug {
  return typeof value === "string" && (DIVISION_SLUGS as readonly string[]).includes(value);
}

export interface Offering {
  name: string;
  summary: string;
}

export interface Division {
  slug: DivisionSlug;
  code: string;
  name: string;
  shortName: string;
  tagline: string;
  summary: string;
  intro: string[];
  image: string;
  imageAlt: string;
  offerings: Offering[];
  applications: string[];
  benefits: { title: string; text: string }[];
  related: DivisionSlug[];
}

export const DIVISIONS: Division[] = [
  {
    slug: "security-systems",
    code: "01",
    name: "Security Systems",
    shortName: "Security",
    tagline: "Layered protection for people, assets and information.",
    summary:
      "Access control, IP CCTV with video analytics, intrusion detection and alarm monitoring — engineered as one coordinated security layer.",
    intro: [
      "Effective security is not a collection of cameras and card readers. It is a designed system in which detection, verification and response work together, and in which every device reports to a coherent operating picture.",
      "We design, supply, install and commission integrated security systems that are sized to the risk profile of each facility, aligned with the client's operational procedures and built to scale as sites grow.",
    ],
    image: securityImg,
    imageAlt: "Security operations room with a wall of CCTV monitors",
    offerings: [
      {
        name: "Access Control",
        summary:
          "Card, PIN, biometric and mobile credentials with zoned permissions, visitor management and full audit trails.",
      },
      {
        name: "IP CCTV & Video Analytics",
        summary:
          "High-resolution IP surveillance with recording, remote viewing and analytics such as line crossing and intrusion zones.",
      },
      {
        name: "Intrusion Detection",
        summary:
          "Perimeter and internal detection using sensors, beams and contacts, partitioned to match how each site operates.",
      },
      {
        name: "Alarm Monitoring",
        summary:
          "Alarm signalling, event verification and escalation workflows so that every alert reaches the right people.",
      },
    ],
    applications: [
      "Embassy and chancery perimeters",
      "Bank branches, vaults and cash centres",
      "Government offices and secure registries",
      "Corporate headquarters and campuses",
      "Data centre white space and plant rooms",
    ],
    benefits: [
      { title: "Unified visibility", text: "Access, video and alarm events in one coordinated view." },
      { title: "Accountability", text: "Every entry, alarm and operator action is logged and traceable." },
      { title: "Scalable design", text: "Open, IP-based architecture that grows with additional sites." },
      { title: "Reduced response time", text: "Verified alarms and clear escalation paths for security teams." },
    ],
    related: ["fire-life-safety", "smart-buildings-ict"],
  },
  {
    slug: "fire-life-safety",
    code: "02",
    name: "Fire & Life Safety",
    shortName: "Fire Safety",
    tagline: "Early detection, clean-agent suppression and clear evacuation.",
    summary:
      "Addressable fire alarms, FM200, Novec and CO2 suppression and emergency voice evacuation for high-value and occupied spaces.",
    intro: [
      "Life-safety systems must work the first time, every time. That depends on correct design, careful installation and disciplined testing — and on maintenance that keeps the system compliant throughout its life.",
      "We deliver detection, suppression and evacuation systems for critical rooms and occupied buildings, coordinated with the building's other services so that an alarm triggers the right sequence of actions.",
    ],
    image: fireImg,
    imageAlt: "Clean-agent fire suppression cylinders installed beside a server room",
    offerings: [
      {
        name: "Addressable Fire Alarms",
        summary:
          "Device-level identification of every detector and call point, so incidents are located precisely and faults are visible.",
      },
      {
        name: "Fire Suppression — FM200, Novec & CO2",
        summary:
          "Clean-agent and gaseous suppression for server rooms, archives, switch rooms and other areas where water is unsuitable.",
      },
      {
        name: "Emergency Voice Evacuation",
        summary:
          "Zoned voice messaging and announcements that guide occupants calmly and clearly during an emergency.",
      },
    ],
    applications: [
      "Server rooms and data centres",
      "Archives, registries and records rooms",
      "Electrical switch rooms and UPS rooms",
      "Multi-storey offices and public buildings",
      "Conference and event venues",
    ],
    benefits: [
      { title: "Precise detection", text: "Addressable devices pinpoint the source of an alarm." },
      { title: "Asset protection", text: "Clean agents suppress fire without damaging sensitive equipment." },
      { title: "Orderly evacuation", text: "Clear voice guidance reduces confusion during emergencies." },
      { title: "Maintained compliance", text: "Documented testing and planned maintenance throughout the system's life." },
    ],
    related: ["security-systems", "smart-buildings-ict"],
  },
  {
    slug: "audio-visual",
    code: "03",
    name: "Audio Visual",
    shortName: "Audio Visual",
    tagline: "Spaces where people communicate clearly and decide quickly.",
    summary:
      "Conference room AV, digital signage and video walls, PA systems and telepresence — designed around how rooms are actually used.",
    intro: [
      "A well-designed room disappears: people walk in, connect and communicate without thinking about the technology. Achieving that requires acoustic awareness, the right displays and a control experience that anyone can use.",
      "We design and integrate audio visual systems for boardrooms, training rooms, auditoriums and public spaces, with standardised user interfaces so that every room behaves the same way.",
    ],
    image: avImg,
    imageAlt: "Executive boardroom with a large video wall and integrated table connectivity",
    offerings: [
      {
        name: "Conference Room AV",
        summary:
          "Displays, cameras, ceiling microphones, speakers and one-touch control for meeting rooms of every size.",
      },
      {
        name: "Digital Signage & Video Walls",
        summary:
          "Centrally managed signage and seamless video walls for lobbies, control rooms and briefing spaces.",
      },
      {
        name: "PA Systems",
        summary:
          "Public address and background music systems with zoning, paging and integration with life-safety alerts.",
      },
      {
        name: "Telepresence",
        summary:
          "High-quality video conferencing that connects offices, missions and partners across regions.",
      },
    ],
    applications: [
      "Boardrooms and executive suites",
      "Diplomatic briefing and reception rooms",
      "Training rooms and auditoriums",
      "Operations and control rooms",
      "Reception areas and public lobbies",
    ],
    benefits: [
      { title: "Consistent experience", text: "Every room operates the same way, reducing support calls." },
      { title: "Clear communication", text: "Intelligible audio and well-placed displays for every seat." },
      { title: "Remote collaboration", text: "Reliable connections between offices and international partners." },
      { title: "Central management", text: "Signage content and room status managed from one place." },
    ],
    related: ["smart-buildings-ict", "security-systems"],
  },
  {
    slug: "smart-buildings-ict",
    code: "04",
    name: "Smart Buildings & ICT",
    shortName: "Smart Buildings",
    tagline: "The infrastructure layer that keeps every other system running.",
    summary:
      "Building management systems, HVAC monitoring, structured cabling, data centres and UPS power protection.",
    intro: [
      "Modern buildings depend on a reliable digital backbone. Structured cabling, resilient power and well-managed plant are the foundation on which security, life-safety and AV systems operate.",
      "We design and deliver building management, network infrastructure and power protection that give facility teams visibility, control and the resilience required by critical operations.",
    ],
    image: smartImg,
    imageAlt: "Data centre with structured cabling and a building management dashboard",
    offerings: [
      {
        name: "Building Management Systems",
        summary:
          "Monitoring and control of building plant with alarms, trends and schedules from a single interface.",
      },
      {
        name: "HVAC Monitoring",
        summary:
          "Temperature, humidity and equipment status monitoring for comfort, efficiency and critical rooms.",
      },
      {
        name: "Structured Cabling",
        summary:
          "Copper and fibre cabling designed, installed, labelled and tested to recognised performance standards.",
      },
      {
        name: "Data Centres",
        summary:
          "Server rooms and data centre fit-out including racks, containment, cabling, cooling coordination and monitoring.",
      },
      {
        name: "UPS & Power Protection",
        summary:
          "Uninterruptible power, surge protection and power distribution for equipment that cannot be allowed to fail.",
      },
    ],
    applications: [
      "Corporate headquarters and office fit-outs",
      "Server rooms and enterprise data centres",
      "Government and institutional buildings",
      "Banking halls and operations centres",
      "Hotels, conference and event venues",
    ],
    benefits: [
      { title: "Operational visibility", text: "Live status of plant, power and environment in one place." },
      { title: "Resilience", text: "Protected power and redundant paths for critical services." },
      { title: "Energy awareness", text: "Data that helps facility teams operate more efficiently." },
      { title: "Future-ready backbone", text: "Cabling and network capacity planned for growth." },
    ],
    related: ["security-systems", "audio-visual"],
  },
  {
    slug: "electrical-plumbing",
    code: "05",
    name: "Electrical & Plumbing",
    shortName: "Electrical & Plumbing",
    tagline: "Dependable power and water services for every building.",
    summary:
      "Electrical installation, wiring, lighting and power distribution, together with plumbing installation and maintenance.",
    intro: [
      "Every technology system depends on safe, well-installed electrical power, and every building depends on reliable water and drainage.",
      "We install, upgrade and maintain electrical and plumbing works so that facilities run safely and the systems we integrate have a sound foundation.",
    ],
    image: smartImg,
    imageAlt: "Building services infrastructure",
    offerings: [
      { name: "Electrical Installation & Wiring", summary: "New installations, rewiring, distribution boards and power outlets." },
      { name: "Lighting", summary: "Indoor, outdoor and security lighting installation." },
      { name: "Power Distribution & Backup", summary: "Distribution, changeover and backup power connections." },
      { name: "Plumbing Installation", summary: "Water supply, drainage and fixture installation." },
      { name: "Plumbing Maintenance & Repairs", summary: "Leak repairs, servicing and planned maintenance." },
    ],
    applications: ["Offices and commercial buildings", "Government and institutional facilities", "Residential developments"],
    benefits: [
      { title: "Safe installations", text: "Work carried out to recognised electrical and plumbing practice." },
      { title: "One contractor", text: "Building services coordinated with your security and ICT works." },
      { title: "Ongoing support", text: "Maintenance and repairs after installation." },
    ],
    related: ["smart-buildings-ict", "security-systems"],
  },
  {
    slug: "iptv-signage",
    code: "06",
    name: "IPTV, Satellite TV & Signage",
    shortName: "IPTV & Signage",
    tagline: "Clear television and information on every screen.",
    summary:
      "IPTV distribution, satellite TV installation for crystal-clear reception, and digital signage displays.",
    intro: [
      "Hotels, offices, institutions and venues need television and information delivered reliably to many screens.",
      "We design and install IPTV and satellite TV systems and digital signage, so content reaches the right screens clearly and is easy to manage.",
    ],
    image: avImg,
    imageAlt: "Display screens showing content",
    offerings: [
      { name: "IPTV Systems", summary: "Television channels distributed over the network to screens across a site." },
      { name: "Satellite TV Systems", summary: "Dish installation and distribution for crystal-clear TV reception." },
      { name: "Digital Signage", summary: "Information and promotional displays with central content management." },
      { name: "Video Walls & Displays", summary: "Display installation for reception areas, lobbies and control rooms." },
    ],
    applications: ["Hotels and guest houses", "Corporate offices and receptions", "Conference and event venues", "Public buildings"],
    benefits: [
      { title: "Clear reception", text: "Properly aligned and distributed signals." },
      { title: "Central control", text: "Channels and signage content managed from one place." },
      { title: "Scalable", text: "Add screens as your facility grows." },
    ],
    related: ["audio-visual", "smart-buildings-ict"],
  },
];

export function getDivision(slug: DivisionSlug): Division {
  const division = DIVISIONS.find((d) => d.slug === slug);
  if (!division) throw new Error(`Unknown division: ${slug}`);
  return division;
}

/** Subcategories offered in the request form, per division. */
export const SUBCATEGORIES: Record<DivisionSlug, string[]> = {
  "security-systems": [
    ...getOfferingNames("security-systems"),
    "Integrated security (multiple systems)",
    "Other / not sure",
  ],
  "fire-life-safety": [...getOfferingNames("fire-life-safety"), "Other / not sure"],
  "audio-visual": [...getOfferingNames("audio-visual"), "Other / not sure"],
  "smart-buildings-ict": [...getOfferingNames("smart-buildings-ict"), "Other / not sure"],
  "electrical-plumbing": [...getOfferingNames("electrical-plumbing"), "Other / not sure"],
  "iptv-signage": [...getOfferingNames("iptv-signage"), "Other / not sure"],
};

function getOfferingNames(slug: DivisionSlug): string[] {
  return DIVISIONS.find((d) => d.slug === slug)?.offerings.map((o) => o.name) ?? [];
}

export interface Industry {
  id: string;
  name: string;
  summary: string;
  priorities: string[];
  divisions: DivisionSlug[];
}

export const INDUSTRIES: Industry[] = [
  {
    id: "diplomatic-missions",
    name: "Diplomatic Missions",
    summary:
      "Embassies, high commissions and international organisations need discreet, rigorously controlled security and dependable communication with headquarters.",
    priorities: [
      "Layered perimeter and access control",
      "Confidential handling of site information",
      "Secure briefing rooms and telepresence",
      "Clean-agent protection for communications rooms",
    ],
    divisions: ["security-systems", "audio-visual", "fire-life-safety"],
  },
  {
    id: "government",
    name: "Government Institutions",
    summary:
      "Ministries, agencies and public buildings require systems that protect people and records while remaining practical for daily public service.",
    priorities: [
      "Visitor management and zoned access",
      "Fire detection and voice evacuation for occupied buildings",
      "Protection of archives and registries",
      "Reliable structured cabling and power",
    ],
    divisions: ["security-systems", "fire-life-safety", "smart-buildings-ict"],
  },
  {
    id: "financial",
    name: "Financial Institutions",
    summary:
      "Banks, insurers and microfinance institutions operate under strict risk and regulatory expectations for physical security and service continuity.",
    priorities: [
      "Vault, cash-handling and branch surveillance",
      "Alarm monitoring and verified response",
      "Resilient power for core systems",
      "Suppression for server and records rooms",
    ],
    divisions: ["security-systems", "smart-buildings-ict", "fire-life-safety"],
  },
  {
    id: "corporate",
    name: "Corporate Enterprises",
    summary:
      "Headquarters, regional offices and campuses benefit from integrated building technology that supports productivity, safety and brand presence.",
    priorities: [
      "Standardised meeting room experiences",
      "Access control across multiple floors and sites",
      "Building management and energy visibility",
      "Digital signage for reception and communication",
    ],
    divisions: ["audio-visual", "security-systems", "smart-buildings-ict"],
  },
  {
    id: "data-centres",
    name: "Data Centres",
    summary:
      "Data centres and server rooms depend on resilient power, environmental control, suppression and strict physical access.",
    priorities: [
      "Clean-agent suppression and early detection",
      "UPS, power distribution and monitoring",
      "Rack-level access control and CCTV",
      "Structured cabling and containment",
    ],
    divisions: ["smart-buildings-ict", "fire-life-safety", "security-systems"],
  },
  {
    id: "venues",
    name: "Conference & Event Venues",
    summary:
      "Hotels, conference centres and event spaces need flexible AV, clear public address and safe management of large audiences.",
    priorities: [
      "Flexible conference and auditorium AV",
      "Zoned PA and voice evacuation",
      "Video walls and digital signage",
      "Crowd-aware CCTV coverage",
    ],
    divisions: ["audio-visual", "fire-life-safety", "security-systems"],
  },
];

export interface Solution {
  id: string;
  name: string;
  summary: string;
  components: string[];
  divisions: DivisionSlug[];
}

export const SOLUTIONS: Solution[] = [
  {
    id: "integrated-security-operations",
    name: "Integrated Security Operations",
    summary:
      "Access control, CCTV, intrusion and alarm events brought together so operators see one picture and respond with confidence.",
    components: ["Access control", "IP CCTV & analytics", "Intrusion detection", "Alarm monitoring workflows"],
    divisions: ["security-systems"],
  },
  {
    id: "critical-room-protection",
    name: "Critical Room Protection",
    summary:
      "A coordinated package for server rooms and data centres: early detection, clean-agent suppression, environmental monitoring and protected power.",
    components: ["Addressable detection", "FM200 / Novec suppression", "HVAC & environment monitoring", "UPS & power protection"],
    divisions: ["fire-life-safety", "smart-buildings-ict"],
  },
  {
    id: "smart-workplace",
    name: "Smart Workplace",
    summary:
      "Meeting rooms, signage and building systems designed together so offices are easier to use, manage and secure.",
    components: ["Conference room AV", "Digital signage", "Building management", "Structured cabling"],
    divisions: ["audio-visual", "smart-buildings-ict"],
  },
  {
    id: "life-safety-integration",
    name: "Life-Safety Integration",
    summary:
      "Fire alarm, voice evacuation, access control and building systems coordinated so that an alarm triggers the correct building-wide response.",
    components: ["Fire alarm cause & effect", "Voice evacuation", "Door release on alarm", "BMS plant shutdown"],
    divisions: ["fire-life-safety", "security-systems", "smart-buildings-ict"],
  },
  {
    id: "secure-communications-rooms",
    name: "Secure Briefing & Communications Rooms",
    summary:
      "Briefing and conference rooms with controlled access, reliable telepresence and appropriate physical protection.",
    components: ["Telepresence", "Room access control", "Conference audio", "Power protection"],
    divisions: ["audio-visual", "security-systems"],
  },
  {
    id: "network-power-backbone",
    name: "Network & Power Backbone",
    summary:
      "The structured cabling, racks and resilient power that every other building system depends on.",
    components: ["Copper & fibre cabling", "Racks & containment", "UPS systems", "Monitoring"],
    divisions: ["smart-buildings-ict"],
  },
];

export const PROCESS_STEPS = [
  {
    step: "01",
    title: "Consultation",
    text: "We listen to your objectives, constraints and risk profile, and agree the scope of what needs to be assessed.",
  },
  {
    step: "02",
    title: "Site Assessment",
    text: "Engineers survey the site, record measurements and observations, and identify technical risks and equipment requirements.",
  },
  {
    step: "03",
    title: "Design & Proposal",
    text: "We prepare a system design and an itemised quotation with clear scope, specifications, exclusions and terms.",
  },
  {
    step: "04",
    title: "Procurement",
    text: "Approved equipment is sourced, received and allocated to the project with recorded stock movements.",
  },
  {
    step: "05",
    title: "Installation",
    text: "Our engineers and technicians install systems to the agreed design, with documented progress updates.",
  },
  {
    step: "06",
    title: "Testing & Commissioning",
    text: "Each system is configured, tested and commissioned against the design before it is put into service.",
  },
  {
    step: "07",
    title: "Handover & Training",
    text: "We hand over documentation, as-built records and user training so your team can operate with confidence.",
  },
  {
    step: "08",
    title: "Maintenance & Support",
    text: "Preventive maintenance schedules, service tickets and warranty tracking keep systems performing after handover.",
  },
] as const;

export const WHY_POINTS = [
  {
    title: "One integration partner",
    text: "Security, fire safety, AV and building infrastructure delivered by one accountable team, designed to work together.",
  },
  {
    title: "Engineering-led delivery",
    text: "Every engagement follows a defined path from assessment to commissioning, with documented decisions at each stage.",
  },
  {
    title: "Discretion by default",
    text: "Site information, drawings and client records are handled confidentially and shared only with authorised people.",
  },
  {
    title: "Support after handover",
    text: "Maintenance, warranty tracking and service requests continue long after the installation team leaves site.",
  },
] as const;
