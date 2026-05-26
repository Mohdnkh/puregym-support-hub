export function renderEmployeeName(text: string, language: "AR" | "EN", user?: { nameAr?: string; nameEn?: string } | null) {
  const name = language === "AR" ? user?.nameAr || "الفريق" : user?.nameEn || "Team";
  return text.replaceAll("{{employeeName}}", name);
}

export function stripOpeningGreeting(text: string) {
  return text
    .replace(/^\s*(حياك الله|هلا|أهلاً وسهلاً|اهلاً وسهلاً|مرحباً|مرحبا)[^\n،,!.]*[،,!\s-]*/i, "")
    .trim();
}
