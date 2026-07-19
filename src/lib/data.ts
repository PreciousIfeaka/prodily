// Stand-in for a real auth/session layer. In a real app this would come
// from your auth provider (e.g. a JWT claim or session lookup), not a
// hardcoded constant. Flip the role here to preview each experience —
// each role only ever sees its own part of the app.
export const session: { role: "employee" | "admin" } = {
  role: "admin",
};

export const employee = {
  name: "Ada",
  fullName: "Ada Okafor",
  initials: "AO",
  team: "Design",
  points: 3450,
  pointsToNext: 550,
  level: "Level 4 · Gold",
  progress: 78,
  ringProgress: 72,
  streak: 12,
  nairaValue: "₦34,500",
  badgesCount: 12,
  monthDelta: "+₦8.2k",
  teamRank: "#3",
};

export type Reward = {
  id: string;
  name: string;
  vendor: string;
  priceLabel: string;
  cost: number;
  category: string;
  tag?: string;
  gradient: string;
  icon: string;
  description: string;
};

export const rewards: Reward[] = [
  {
    id: "lunch-voucher",
    name: "Lunch Voucher",
    vendor: "Foodie",
    priceLabel: "₦2,500",
    cost: 250,
    category: "Food",
    tag: "Popular",
    gradient: "linear-gradient(140deg,#6366f1,#8b5cf6)",
    icon: "utensils",
    description:
      "Redeem for a meal at any partner restaurant in the Foodie network. Valid for 30 days from redemption.",
  },
  {
    id: "movie-ticket",
    name: "Movie Ticket",
    vendor: "Filmhouse",
    priceLabel: "2D",
    cost: 400,
    category: "Entertainment",
    gradient: "linear-gradient(140deg,#f43f5e,#fb7185)",
    icon: "clapperboard",
    description: "One standard 2D ticket at any Filmhouse Cinema nationwide, valid any day of the week.",
  },
  {
    id: "gift-card",
    name: "Gift Card",
    vendor: "Amazon",
    priceLabel: "₦10,000",
    cost: 950,
    category: "Entertainment",
    gradient: "linear-gradient(140deg,#f59e0b,#fbbf24)",
    icon: "gift",
    description: "A ₦10,000 Amazon gift card delivered to your email instantly after redemption.",
  },
  {
    id: "wellness-pass",
    name: "Wellness Pass",
    vendor: "FitLife Gym",
    priceLabel: "1 month",
    cost: 700,
    category: "Wellness",
    gradient: "linear-gradient(140deg,#10b981,#34d399)",
    icon: "heart",
    description: "One month unlimited access to any FitLife Gym location, including classes.",
  },
  {
    id: "ride-credit",
    name: "Ride Credit",
    vendor: "Bolt",
    priceLabel: "₦5,000",
    cost: 480,
    category: "Transport",
    gradient: "linear-gradient(140deg,#4338ca,#6366f1)",
    icon: "car",
    description: "₦5,000 in ride credit applied directly to your Bolt wallet.",
  },
  {
    id: "course-voucher",
    name: "Course Voucher",
    vendor: "Udemy",
    priceLabel: "Any course",
    cost: 320,
    category: "Learning",
    gradient: "linear-gradient(140deg,#8b5cf6,#a78bfa)",
    icon: "book",
    description: "Enroll in any single course on Udemy, up to a value of ₦15,000.",
  },
];

export const recentActivity = [
  { id: 1, title: "Lunch voucher redeemed", subtitle: "Marketplace · Today", amount: -250, tone: "indigo", icon: "gift" },
  { id: 2, title: "Kudos from Tunde", subtitle: "Peer recognition · Yesterday", amount: 50, tone: "rose", icon: "heart" },
  { id: 3, title: "Sprint completed", subtitle: "Auto reward · 2 days ago", amount: 300, tone: "mint", icon: "check" },
];

export const rewardHistory = [
  { id: 1, title: "Lunch voucher", subtitle: "Redeemed · code LV-2231", amount: -250, tone: "indigo", icon: "gift" },
  { id: 2, title: "Sprint bonus", subtitle: "Auto reward · Issued", amount: 300, tone: "mint", icon: "bolt" },
  { id: 3, title: "Streak reward", subtitle: "7-day streak · Issued", amount: 120, tone: "gold", icon: "flame" },
];

export const badges = [
  { id: 1, name: "Fast Shipper", gradient: "linear-gradient(140deg,#6366f1,#8b5cf6)", icon: "zap", locked: false },
  { id: 2, name: "Streak Master", gradient: "linear-gradient(140deg,#f59e0b,#fbbf24)", icon: "flame", locked: false },
  { id: 3, name: "On-Time Hero", gradient: "linear-gradient(140deg,#10b981,#34d399)", icon: "check", locked: false },
  { id: 4, name: "Team Player", gradient: "linear-gradient(140deg,#f43f5e,#fb7185)", icon: "heart", locked: false },
  { id: 5, name: "Lifelong Learner", gradient: "linear-gradient(140deg,#8b5cf6,#a78bfa)", icon: "book", locked: false },
  { id: 6, name: "Innovator", gradient: "", icon: "lock", locked: true },
];

export const challenges = [
  {
    id: 1,
    name: "Team Sprint Champion",
    meta: "Design team · Ends in 4 days",
    progress: 65,
    gradient: "linear-gradient(140deg,#6366f1,#8b5cf6)",
    icon: "trophy",
    leads: ["AO", "TB", "CN"],
    prize: "500 pts",
  },
  {
    id: 2,
    name: "30-Day Wellness Streak",
    meta: "Company-wide · 12/30 days",
    progress: 40,
    gradient: "linear-gradient(140deg,#10b981,#34d399)",
    icon: "heart",
    leads: ["BE", "AO"],
    prize: "300 pts",
  },
  {
    id: 3,
    name: "Learning Marathon",
    meta: "Optional · Ends in 2 weeks",
    progress: 20,
    gradient: "linear-gradient(140deg,#f59e0b,#fbbf24)",
    icon: "book",
    leads: ["CN", "TB", "AO"],
    prize: "250 pts",
  },
];

export const feedPosts = [
  {
    id: 1,
    name: "Tunde Balogun",
    time: "2h ago",
    body: "Huge shoutout to @Ada for pulling the checkout redesign together overnight. Client loved it!",
    mention: "@Ada",
    award: { title: "Team Player award", subtitle: "+50 pts · from Tunde Balogun" },
    likes: 14,
    comments: 3,
  },
  {
    id: 2,
    name: "Chidi Nwosu",
    time: "5h ago",
    body: "Hit my 12-day check-in streak today. Small wins add up 🔥",
    likes: 9,
    comments: 1,
  },
  {
    id: 3,
    name: "Blessing Eze",
    time: "1d ago",
    body: "Wrapped the Q3 design system audit. Thanks to everyone who reviewed components this week.",
    award: { title: "Fast Shipper award", subtitle: "+50 pts · from HR Team" },
    likes: 21,
    comments: 5,
  },
];

// ---------------- ADMIN DATA ----------------

export const adminKpis = [
  { label: "Points issued", value: "482,300", delta: "+12.4%", tone: "mint" },
  { label: "Redemption rate", value: "68%", delta: "+3.1%", tone: "mint" },
  { label: "Active employees", value: "1,204", delta: "+2.0%", tone: "mint" },
  { label: "Budget utilised", value: "₦6.4M / ₦10M", delta: "64%", tone: "gold" },
];

export const budgetTree = [
  {
    id: "org",
    name: "Acme Corp (Org)",
    subtitle: "Annual budget",
    amount: "₦10,000,000",
    icon: "building",
    children: [
      {
        id: "eng",
        name: "Engineering",
        subtitle: "48 employees",
        amount: "₦4,200,000",
        icon: "code",
      },
      {
        id: "design",
        name: "Design",
        subtitle: "16 employees",
        amount: "₦1,800,000",
        icon: "palette",
      },
      {
        id: "support",
        name: "Support",
        subtitle: "22 employees",
        amount: "₦2,400,000",
        icon: "headset",
      },
      {
        id: "sales",
        name: "Sales",
        subtitle: "19 employees",
        amount: "₦1,600,000",
        icon: "trending",
      },
    ],
  },
];

export type RewardRule = {
  id: number;
  name: string;
  metric: string;
  operator: string;
  threshold: string;
  frequency: string;
  reward: string;
  approval: "auto-approve" | "needs approval";
  icon: string;
  tint: "violet" | "gold" | "mint";
  enabled: boolean;
  // Which stage-2 engine evaluates this rule. "rule_engine" = deterministic
  // threshold check. "ai_recommendation" = scored by the AI recommender and
  // always routed to a manager for approve/modify/reject.
  engine: "rule_engine" | "ai_recommendation";
};

export const rewardRules: RewardRule[] = [
  {
    id: 1,
    name: "Sprint Completion Bonus",
    metric: "Sprint Completion",
    operator: "≥",
    threshold: "100%",
    frequency: "weekly",
    reward: "+300 pts",
    approval: "auto-approve",
    icon: "zap",
    tint: "violet",
    enabled: true,
    engine: "rule_engine",
  },
  {
    id: 2,
    name: "Productivity Streak",
    metric: "Streak",
    operator: "≥",
    threshold: "7 days",
    frequency: "daily",
    reward: "+120 pts",
    approval: "auto-approve",
    icon: "droplet",
    tint: "gold",
    enabled: true,
    engine: "rule_engine",
  },
  {
    id: 3,
    name: "On-Time Delivery",
    metric: "On-Time Rate",
    operator: "≥",
    threshold: "95%",
    frequency: "monthly",
    reward: "₦5,000 voucher",
    approval: "auto-approve",
    icon: "circlecheck",
    tint: "mint",
    enabled: true,
    engine: "rule_engine",
  },
  {
    id: 4,
    name: "Peer Recognition",
    metric: "Peer Kudos",
    operator: "received",
    threshold: "",
    frequency: "weekly",
    reward: "AI-scored",
    approval: "needs approval",
    icon: "sparkles",
    tint: "violet",
    enabled: true,
    engine: "ai_recommendation",
  },
  {
    id: 5,
    name: "Learning Completion",
    metric: "Course",
    operator: "completed",
    threshold: "",
    frequency: "monthly",
    reward: "₦15,000 credit",
    approval: "needs approval",
    icon: "book",
    tint: "violet",
    enabled: false,
    engine: "rule_engine",
  },
  {
    id: 6,
    name: "Attendance Streak",
    metric: "Attendance",
    operator: "≥",
    threshold: "30 days",
    frequency: "monthly",
    reward: "+200 pts",
    approval: "auto-approve",
    icon: "flame",
    tint: "gold",
    enabled: true,
    engine: "rule_engine",
  },
];

export const approvalRows = [
  { id: 1, name: "Ada Okafor", team: "Design", initials: "AO", color: "#6366f1", item: "Sprint bonus", amount: "₦12,000", status: "Pending" },
  { id: 2, name: "Tunde Balogun", team: "Engineering", initials: "TB", color: "#f59e0b", item: "Peer kudos", amount: "₦2,500", status: "Pending" },
  { id: 3, name: "Blessing Eze", team: "Design", initials: "BE", color: "#10b981", item: "Emergency Transport", amount: "₦8,000", status: "Team Lead" },
  { id: 4, name: "Chidi Nwosu", team: "Support", initials: "CN", color: "#8b5cf6", item: "Movie Ticket", amount: "₦4,000", status: "Auto-approved" },
];

export const fraudFlags = [
  {
    id: 1,
    title: "Duplicate reward request",
    subtitle: "Ada Okafor · Sprint bonus · ₦12,000 · 2 min ago",
    amount: 12000,
    reasons: ["Duplicate request", "Same metric 2× today", "Idempotency key match"],
  },
  {
    id: 2,
    title: "Artificial streak farming",
    subtitle: "Unknown user · Wellness streak · ₦6,000 · 1 hr ago",
    amount: 6000,
    reasons: ["Unusual time logging", "Check-ins < 1 min apart"],
  },
  {
    id: 3,
    title: "Suspicious manager approval",
    subtitle: "Team Lead · 9 manual rewards · ₦50,000 · today",
    amount: 50000,
    reasons: ["Excessive manual rewards", "Above threshold"],
  },
];

// ---------------- REWARD PIPELINE (end-to-end flow) ----------------
// Mirrors the 5 stages of the Figma flow:
//   1. Earning & triggers   2. Evaluation & AI   3. Integrity & budget
//   4. Approval workflow    5. Redemption & fulfilment
// Each RewardRequest sits at one node of that flow. Advancing it (see
// src/lib/pipeline.ts) is what moves it to the next node, exactly like the
// arrows on the board.

export type TriggerSource = "performance" | "challenge" | "peer";

export type PipelineStage =
  | "monitoring" // 1 · tracked, hasn't cleared the rule engine yet
  | "rule_check" // 2 · Reward rule engine → "Threshold met?"
  | "manager_review" // 2 · AI recommendation → "Manager decision"
  | "pending_review" // 3 · flagged by "Suspicious activity?" → PENDING_REVIEW
  | "budget_check" // 3 · cleared integrity, awaiting "Budget available?"
  | "approval" // 4 · tiered approval by reward amount
  | "redemption" // 5 · issued & reserved, awaiting "Employee redeems?"
  | "redeemed" // 5 · terminal — vendor voucher generated
  | "expired" // 5 · terminal — funds returned to budget
  | "rejected"; // terminal — "Rejected & notified"

export type ApprovalTier = "auto-approve" | "team-lead" | "team-lead-hr-finance";

export function approvalTierFor(amount: number): ApprovalTier {
  if (amount > 20000) return "team-lead-hr-finance";
  if (amount >= 5001) return "team-lead";
  return "auto-approve";
}

export const approvalTierLabel: Record<ApprovalTier, string> = {
  "auto-approve": "Auto-approve",
  "team-lead": "Team Lead approval",
  "team-lead-hr-finance": "Team Lead → HR → Finance",
};

export type RewardRequest = {
  id: string;
  employee: string;
  initials: string;
  team: string;
  color: string;
  source: TriggerSource;
  triggerLabel: string;
  engine: "rule_engine" | "ai_recommendation";
  amount: number;
  ruleName: string;
  stage: PipelineStage;
  // Precomputed outcomes the pipeline reveals as a request is advanced,
  // so the demo is deterministic rather than randomized on every click.
  thresholdMet?: boolean;
  aiConfidence?: number;
  suspicious?: boolean;
  suspiciousReasons?: string[];
  budgetAvailable?: boolean;
  approvalTier?: ApprovalTier;
  voucherCode?: string;
  rejectionReason?: string;
  history: { label: string; at: string }[];
};

export const rewardRequests: RewardRequest[] = [
  {
    id: "rr-1",
    employee: "Ada Okafor",
    initials: "AO",
    team: "Design",
    color: "#6366f1",
    source: "performance",
    triggerLabel: "Sprint completion logged at 100%",
    engine: "rule_engine",
    ruleName: "Sprint Completion Bonus",
    amount: 12000,
    stage: "rule_check",
    thresholdMet: true,
    suspicious: false,
    budgetAvailable: true,
    history: [{ label: "Activity tracked · Sprint Completion Bonus rule triggered", at: "9:02 AM" }],
  },
  {
    id: "rr-2",
    employee: "Tunde Balogun",
    initials: "TB",
    team: "Engineering",
    color: "#f59e0b",
    source: "peer",
    triggerLabel: "Kudos received from 3 teammates",
    engine: "ai_recommendation",
    ruleName: "Peer Recognition",
    amount: 2500,
    stage: "manager_review",
    aiConfidence: 92,
    suspicious: false,
    budgetAvailable: true,
    history: [
      { label: "Activity tracked · peer kudos received", at: "8:14 AM" },
      { label: "AI recommendation: reward, 92% confidence", at: "8:15 AM" },
    ],
  },
  {
    id: "rr-3",
    employee: "Blessing Eze",
    initials: "BE",
    team: "Design",
    color: "#10b981",
    source: "performance",
    triggerLabel: "Sprint completion logged at 100%",
    engine: "rule_engine",
    ruleName: "Sprint Completion Bonus",
    amount: 8000,
    stage: "pending_review",
    thresholdMet: true,
    suspicious: true,
    suspiciousReasons: ["Duplicate request", "Same metric 2× today"],
    budgetAvailable: true,
    history: [
      { label: "Activity tracked · Sprint Completion Bonus rule triggered", at: "Yesterday" },
      { label: "Threshold met · reward request created", at: "Yesterday" },
      { label: "Flagged suspicious · duplicate signature", at: "Yesterday" },
    ],
  },
  {
    id: "rr-4",
    employee: "Chidi Nwosu",
    initials: "CN",
    team: "Support",
    color: "#8b5cf6",
    source: "challenge",
    triggerLabel: "\u201cOn-Time Delivery\u201d challenge completed",
    engine: "rule_engine",
    ruleName: "On-Time Delivery",
    amount: 15000,
    stage: "budget_check",
    thresholdMet: true,
    suspicious: false,
    budgetAvailable: true,
    history: [
      { label: "Activity tracked · challenge completed", at: "2 days ago" },
      { label: "Threshold met · reward request created", at: "2 days ago" },
      { label: "Integrity check cleared · no suspicious signal", at: "2 days ago" },
    ],
  },
  {
    id: "rr-5",
    employee: "Ngozi Adeyemi",
    initials: "NA",
    team: "Sales",
    color: "#f43f5e",
    source: "challenge",
    triggerLabel: "Quarterly sales challenge completed",
    engine: "rule_engine",
    ruleName: "Sprint Completion Bonus",
    amount: 12500,
    stage: "approval",
    thresholdMet: true,
    suspicious: false,
    budgetAvailable: true,
    approvalTier: "team-lead",
    history: [
      { label: "Activity tracked · challenge completed", at: "3 days ago" },
      { label: "Threshold met · reward request created", at: "3 days ago" },
      { label: "Integrity + budget cleared", at: "3 days ago" },
    ],
  },
  {
    id: "rr-6",
    employee: "Femi Adebayo",
    initials: "FA",
    team: "Engineering",
    color: "#0891b2",
    source: "performance",
    triggerLabel: "7-day productivity streak",
    engine: "rule_engine",
    ruleName: "Productivity Streak",
    amount: 3000,
    stage: "approval",
    thresholdMet: true,
    suspicious: false,
    budgetAvailable: true,
    approvalTier: "auto-approve",
    history: [
      { label: "Activity tracked · 7-day streak", at: "4 hrs ago" },
      { label: "Threshold met · reward request created", at: "4 hrs ago" },
      { label: "Integrity + budget cleared", at: "3 hrs ago" },
    ],
  },
  {
    id: "rr-7",
    employee: "Kemi Afolabi",
    initials: "KA",
    team: "Marketing",
    color: "#14b8a6",
    source: "peer",
    triggerLabel: "Kudos received from manager",
    engine: "ai_recommendation",
    ruleName: "Peer Recognition",
    amount: 2500,
    stage: "redemption",
    aiConfidence: 88,
    suspicious: false,
    budgetAvailable: true,
    approvalTier: "auto-approve",
    history: [
      { label: "AI recommendation approved by manager", at: "1 week ago" },
      { label: "Integrity + budget cleared", at: "1 week ago" },
      { label: "Auto-approved · logged to audit", at: "1 week ago" },
      { label: "Reward issued & reserved", at: "1 week ago" },
    ],
  },
  {
    id: "rr-8",
    employee: "Yusuf Ibrahim",
    initials: "YI",
    team: "Finance",
    color: "#dc2626",
    source: "challenge",
    triggerLabel: "Cost-saving challenge completed",
    engine: "rule_engine",
    ruleName: "Sprint Completion Bonus",
    amount: 28000,
    stage: "rejected",
    thresholdMet: true,
    suspicious: false,
    budgetAvailable: false,
    rejectionReason: "Department budget exhausted for this cycle",
    history: [
      { label: "Threshold met · reward request created", at: "2 weeks ago" },
      { label: "Integrity cleared", at: "2 weeks ago" },
      { label: "Budget unavailable · rejected & notified", at: "2 weeks ago" },
    ],
  },
  {
    id: "rr-9",
    employee: "Grace Umeh",
    initials: "GU",
    team: "Support",
    color: "#a855f7",
    source: "performance",
    triggerLabel: "On-time rate 95%+ this month",
    engine: "rule_engine",
    ruleName: "On-Time Delivery",
    amount: 5000,
    stage: "redeemed",
    thresholdMet: true,
    suspicious: false,
    budgetAvailable: true,
    approvalTier: "auto-approve",
    voucherCode: "VC-88213",
    history: [
      { label: "Threshold met · reward request created", at: "3 weeks ago" },
      { label: "Integrity + budget cleared", at: "3 weeks ago" },
      { label: "Auto-approved · logged to audit", at: "3 weeks ago" },
      { label: "Reward issued & reserved", at: "3 weeks ago" },
      ]
    },
  {
    id: "rr-10",
    employee: "Emeka Obi",
    initials: "EO",
    team: "Engineering",
    color: "#334155",
    source: "performance",
    triggerLabel: "On-time rate at 91% this month",
    engine: "rule_engine",
    ruleName: "On-Time Delivery",
    amount: 5000,
    stage: "monitoring",
    thresholdMet: false,
    suspicious: false,
    budgetAvailable: true,
    history: [{ label: "Activity tracked · below 95% threshold", at: "Today" }],
  },
];



export function formatNairaShort(amount: number): string {
  if (amount >= 1000) {
    const thousands = amount / 1000;
    const rounded = Number.isInteger(thousands) ? thousands : thousands.toFixed(1);
    return `₦${rounded}k`;
  }
  return `₦${amount}`;
}
