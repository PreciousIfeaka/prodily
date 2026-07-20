export type SessionRole = "admin" | "team_lead" | "team_member";

export function getRoleHome(role: string | null | undefined) {
  switch (role?.toLowerCase()) {
    case "admin":
      return "/admin";
    case "team_lead":
      return "/team-lead";
    case "team_member":
      return "/employee";
    default:
      return "/signin";
  }
}
