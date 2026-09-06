import type { Messages } from "@/lib/i18n/messages";

export interface DigestEmailInput {
  displayName: string;
  views: number;
  clicks: number;
  prevViews: number;
  prevClicks: number;
  topServiceName?: string;
  suggestion?: { type: string; label: string; url: string } | null;
  unsubUrl: string;
  isPro: boolean;
  messages: Messages;
}

export interface DigestEmailOutput {
  subject: string;
  html: string;
}

function variation(current: number, previous: number): { label: string; symbol: string } {
  if (previous === 0) {
    return { label: current > 0 ? `+${current}%` : "0%", symbol: current > 0 ? "\u2191" : "=" };
  }
  const diff = ((current - previous) / previous) * 100;
  if (diff > 0) return { label: `+${Math.round(diff)}%`, symbol: "\u2191" };
  if (diff < 0) return { label: `${Math.round(diff)}%`, symbol: "\u2193" };
  return { label: "0%", symbol: "=" };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "\u0026")
    .replace(/</g, "\u003C")
    .replace(/>/g, "\u003E")
    .replace(/"/g, "\u0022")
    .replace(/'/g, "\u0027");
}

export function buildDigestEmail(input: DigestEmailInput): DigestEmailOutput {
  const { displayName, views, clicks, prevViews, prevClicks, topServiceName, suggestion, unsubUrl, isPro, messages } = input;
  const d = messages.digest;

  const viewsVar = variation(views, prevViews);
  const clicksVar = variation(clicks, prevClicks);

  const subject = d.subject.replace("{name}", displayName);

  const topServiceHtml = topServiceName
    ? `
      <div style="margin-top: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
        <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">${escapeHtml(d.topService)}</div>
        <div style="font-size: 16px; color: #111827;">${escapeHtml(topServiceName)}</div>
      </div>
    `
    : "";

  const suggestionHtml = suggestion && !isPro
    ? `
      <div style="margin-top: 24px; padding: 20px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
        <div style="font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 8px;">${escapeHtml(d.suggestionTitle)}</div>
        <div style="font-size: 16px; color: #1e3a8a; margin-bottom: 16px;">${escapeHtml(suggestion.label)}</div>
        <a href="${escapeHtml(suggestion.url)}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">${escapeHtml(d.proCtaLabel)}</a>
      </div>
    `
    : "";

  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #111827; background: #f3f4f6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff;">
      <tr>
        <td style="padding: 32px 24px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <div style="font-size: 24px; font-weight: 700; color: #111827;">Bizko</div>
        </td>
      </tr>
      <tr>
        <td style="padding: 32px 24px;">
          <div style="font-size: 16px; color: #374151; margin-bottom: 24px;">${escapeHtml(d.hello.replace("{name}", displayName))}</div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; width: 50%;">
                <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">${escapeHtml(d.viewsLabel)}</div>
                <div style="font-size: 28px; font-weight: 700; color: #111827; margin-top: 4px;">${views}</div>
                <div style="font-size: 12px; color: ${viewsVar.symbol === "\u2191" ? "#16a34a" : viewsVar.symbol === "\u2193" ? "#dc2626" : "#6b7280"}; margin-top: 4px;">${viewsVar.symbol} ${escapeHtml(viewsVar.label)}</div>
              </td>
              <td style="padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; width: 50%;">
                <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">${escapeHtml(d.clicksLabel)}</div>
                <div style="font-size: 28px; font-weight: 700; color: #111827; margin-top: 4px;">${clicks}</div>
                <div style="font-size: 12px; color: ${clicksVar.symbol === "\u2191" ? "#16a34a" : clicksVar.symbol === "\u2193" ? "#dc2626" : "#6b7280"}; margin-top: 4px;">${clicksVar.symbol} ${escapeHtml(clicksVar.label)}</div>
              </td>
            </tr>
          </table>

          ${topServiceHtml}
          ${suggestionHtml}

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">${escapeHtml(d.footerUnsub)}</div>
            <a href="${escapeHtml(unsubUrl)}" style="font-size: 13px; color: #6b7280; text-decoration: underline;">${escapeHtml(d.footerUnsubLink)}</a>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; background: #f9fafb;">
          <div style="font-size: 12px; color: #9ca3af;">${escapeHtml(d.footerBrand)}</div>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  return { subject, html };
}