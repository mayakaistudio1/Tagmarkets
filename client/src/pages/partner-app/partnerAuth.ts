export function getPartnerAuthHeader(): Record<string, string> {
  const webToken = localStorage.getItem("partnerWebToken");
  if (webToken) return { "x-partner-token": webToken };
  const tg = (window as any).Telegram?.WebApp;
  const userId = tg?.initDataUnsafe?.user?.id?.toString();
  if (userId) return { "x-telegram-id": userId };
  return {};
}

export function clearPartnerSession(): void {
  sessionStorage.setItem("partnerLoggedOut", "true");
  localStorage.removeItem("partnerWebToken");
  localStorage.removeItem("partnerTelegramId");
  sessionStorage.removeItem("partnerTelegramId");
}

export function getStoredTelegramId(): string | null {
  if (sessionStorage.getItem("partnerLoggedOut") === "true") return null;
  const tg = (window as any).Telegram?.WebApp;
  const userId = tg?.initDataUnsafe?.user?.id?.toString();
  if (userId) return userId;
  if (localStorage.getItem("partnerWebToken")) {
    return localStorage.getItem("partnerTelegramId");
  }
  return null;
}

export function hasPartnerSession(): boolean {
  if (sessionStorage.getItem("partnerLoggedOut") === "true") return false;
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user?.id) return true;
  return !!localStorage.getItem("partnerWebToken");
}
