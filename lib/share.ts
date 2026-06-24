// Pure URL builders for social sharing — no SDKs required.
export type ShareTarget = "whatsapp" | "facebook" | "x" | "linkedin";

export function buildShareUrl(target: ShareTarget, url: string, text = ""): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (target) {
    case "whatsapp":
      return `https://wa.me/?text=${t}%20${u}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case "x":
      return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
  }
}
