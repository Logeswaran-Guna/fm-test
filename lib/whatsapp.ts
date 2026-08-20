// Thin client for the WhatsApp Cloud API (Meta, direct — no BSP). Every
// send is a pre-approved template message; Meta rejects anything else as a
// business-initiated message outside the 24h customer-service window.
// Requires WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID (see
// .env.local) — both come from Meta for Developers once the WhatsApp
// Business Platform app + phone number exist.

const GRAPH_API_VERSION = "v21.0";

export type WhatsAppTemplateParams = {
  to: string;
  templateName: string;
  languageCode?: string;
  bodyParams: string[];
};

// Meta wants E.164 digits with no "+", no spaces — this app stores phone
// numbers as whatever the signup form's free-text input received (see
// find-tutor/become-a-tutor forms), so normalize before every send rather
// than trusting the stored format.
export function normalizeIndianPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 13 && digits.startsWith("091")) return digits.slice(1);
  return null; // not a recognizable Indian mobile number — caller should skip the send
}

export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = "en",
  bodyParams,
}: WhatsAppTemplateParams): Promise<{ ok: boolean; error?: string }> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!accessToken || !phoneNumberId) {
    return { ok: false, error: "WhatsApp API not configured" };
  }

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: [
            {
              type: "body",
              parameters: bodyParams.map((text) => ({ type: "text", text })),
            },
          ],
        },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    return { ok: false, error: `Meta API ${response.status}: ${body}` };
  }
  return { ok: true };
}
