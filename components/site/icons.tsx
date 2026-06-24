import {
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link2,
} from "lucide-react";

// Brand icons lucide doesn't ship (Pinterest, Spotify, Threads) as small SVGs.
function Pinterest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.5 2 2 6 2 11c0 3.7 2.2 6.9 5.4 8.3-.1-.7-.1-1.8 0-2.6l1.3-5.6s-.3-.7-.3-1.7c0-1.6.9-2.8 2.1-2.8 1 0 1.5.7 1.5 1.6 0 1-.6 2.5-1 3.9-.3 1.1.6 2.1 1.7 2.1 2 0 3.5-2.1 3.5-5.2 0-2.7-1.9-4.6-4.7-4.6-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 .9 2.6.1.1.1.2.1.3l-.3 1.2c0 .2-.2.3-.4.2-1.4-.7-2.3-2.7-2.3-4.4 0-3.6 2.6-6.9 7.5-6.9 3.9 0 7 2.8 7 6.6 0 3.9-2.5 7.1-5.9 7.1-1.2 0-2.3-.6-2.6-1.3l-.7 2.7c-.3 1-1 2.3-1.5 3.1.9.3 1.9.4 2.9.4 5.5 0 10-4 10-9C22 6 17.5 2 12 2z" />
    </svg>
  );
}
function Spotify({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.6 14.4c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.3-1-.4.1-.7-.1-.8-.5-.1-.4.1-.7.5-.8 4-.9 7.5-.5 10.3 1.2.3.2.4.6.2.9zm1.2-2.7c-.2.4-.7.5-1.1.3-2.8-1.7-7.1-2.2-10.4-1.2-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.8-1.1 8.5-.6 11.7 1.4.4.2.5.7.3 1zm.1-2.8C14.6 9 8.9 8.8 5.6 9.8c-.5.2-1.1-.1-1.2-.6-.2-.5.1-1.1.6-1.2 3.8-1.1 10.1-.9 14 1.4.5.3.6.9.4 1.4-.3.4-.9.6-1.4.3z" />
    </svg>
  );
}
function Threads({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.3 11.2c-.1 0-.2-.1-.3-.1-.2-3-1.8-4.7-4.6-4.7-1.6 0-3 .7-3.8 2l1.5 1c.6-.9 1.4-1.1 2.3-1.1 1.5 0 2.3.9 2.5 2.3-.6-.1-1.2-.2-1.9-.2-2.6 0-4.3 1.4-4.2 3.4.1 1.7 1.5 2.8 3.4 2.8 1.5 0 2.6-.6 3.2-1.7.4.6.6 1.4.6 2.3l1.8-.1c-.1-1.4-.5-2.5-1.2-3.3.6-.7 1-1.6 1-2.6 0-.5 0-.9-.1-1.2zm-5.4 4.9c-.7 0-1.5-.3-1.5-1.1-.1-1 1.1-1.4 2.3-1.4.6 0 1.1.1 1.6.2-.2 1.4-1.1 2.3-2.4 2.3z" />
    </svg>
  );
}

const MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  x: Twitter,
  twitter: Twitter,
  linkedin: Linkedin,
  pinterest: Pinterest,
  spotify: Spotify,
  threads: Threads,
  email: Mail,
  mail: Mail,
};

export function SocialIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  const Cmp = MAP[platform.toLowerCase()] ?? Link2;
  return <Cmp className={className} />;
}
