import Image from "next/image";
import { updateSettings } from "@/app/admin/actions";
import { PageHeader, Card, Field, inputCls } from "@/components/admin/ui";
import { PendingButton } from "@/components/admin/confirm-submit";
import { BannerUploader } from "@/components/admin/banner-uploader";
import { getQuotes, getSettings } from "@/lib/queries";
import { storageUrl } from "@/lib/storage";

function Toggle({
  name,
  label,
  hint,
  on,
}: {
  name: string;
  label: string;
  hint?: string;
  on?: boolean | null;
}) {
  return (
    <label className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0">
      <span>
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      </span>
      <input type="checkbox" name={name} defaultChecked={!!on} className="h-5 w-5" />
    </label>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const saved = (await searchParams)?.saved === "1";
  const [settings, quotes] = await Promise.all([getSettings(), getQuotes(50)]);
  const portrait = storageUrl("portraits", settings?.portrait_path);
  const header = storageUrl("header", settings?.header_image);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings and banner" desc="Your photo, channel banner, sponsor, ads and integrations." />
      {saved && (
        <div className="mb-5 rounded-lg border border-green-600/40 bg-green-600/10 px-4 py-3 text-sm text-green-500">
          Saved. Your changes are live on the site.
        </div>
      )}

      <form action={updateSettings} className="space-y-6">
        <Card>
          <h2 className="mb-2 font-medium">Site visibility</h2>
          <p className="mb-3 text-sm text-muted">When OFF, visitors see a "Coming soon" page while you edit privately (you can still log in and preview). Turn ON to go public.</p>
          <Toggle name="site_live" label="Site is LIVE to the public" on={settings?.site_live} />
        </Card>

        <Card>
          <h2 className="mb-2 font-medium">Channel header image</h2>
          <p className="mb-4 text-sm text-muted">
            Like a YouTube banner. No 5 MB limit, upload full quality. Recommended 2560x1440.
          </p>
          <BannerUploader currentUrl={header} defaultFocus={settings?.header_focus_x ?? 50} />
        </Card>

        <Card>
          <h2 className="mb-2 font-medium">Your photo</h2>
          <p className="mb-4 text-sm text-muted">Shown above the featured quote. No 5 MB limit.</p>
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-20 overflow-hidden rounded-lg border border-line">
              {portrait ? (
                <Image src={portrait} alt="Current portrait" fill className="object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-[10px] text-muted">none</div>
              )}
            </div>
            <input type="file" name="portrait" accept="image/*" className="text-sm" />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-medium">Homepage text</h2>
          <div className="space-y-4">
            <Field label="Top small text"><input name="hero_eyebrow" defaultValue={settings?.hero_eyebrow ?? ""} className={inputCls} /></Field>
            <Field label="Headline"><input name="hero_headline" defaultValue={settings?.hero_headline ?? ""} className={inputCls} /></Field>
            <Field label="Sub-headline"><textarea name="hero_sub" defaultValue={settings?.hero_sub ?? ""} rows={2} className={`${inputCls} h-auto py-2`} /></Field>
            <Field label="Site title"><input name="site_title" defaultValue={settings?.site_title ?? ""} className={inputCls} /></Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 font-medium">Featured quote</h2>
          <p className="mb-4 text-sm text-muted">Leave on "Latest uploaded" to always show your newest quote.</p>
          <select name="featured_quote_id" defaultValue={settings?.featured_quote_id ?? ""} className={inputCls}>
            <option value="">Latest uploaded (automatic)</option>
            {quotes.map((q) => (
              <option key={q.id} value={q.id}>{q.title || q.caption || q.id.slice(0, 8)}</option>
            ))}
          </select>
        </Card>

        <Card>
          <h2 className="mb-2 font-medium">Sponsor banner (scrolling headline)</h2>
          <p className="mb-4 text-sm text-muted">A thin headline that scrolls right to left. Visitors cannot close it; only you toggle it here.</p>
          <Toggle name="sponsor_enabled" label="Sponsor banner is live" on={settings?.sponsor_enabled} />
          <div className="mt-4 space-y-4">
            <Field label="Banner text"><input name="sponsor_text" defaultValue={settings?.sponsor_text ?? ""} className={inputCls} /></Field>
            <Field label="Link when clicked"><input name="sponsor_url" defaultValue={settings?.sponsor_url ?? ""} className={inputCls} placeholder="https://sponsor.com" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Font">
                <select name="sponsor_font" defaultValue={settings?.sponsor_font ?? "serif"} className={inputCls}>
                  <option value="serif">Serif (Fraunces)</option>
                  <option value="sans">Sans (Inter)</option>
                </select>
              </Field>
              <Field label="Scroll speed">
                <select name="sponsor_speed" defaultValue={settings?.sponsor_speed ?? "normal"} className={inputCls}>
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Text colour"><input type="color" name="sponsor_color" defaultValue={settings?.sponsor_color ?? "#c9b384"} className="h-11 w-full rounded-md border border-line bg-transparent" /></Field>
              <Field label="Background colour"><input type="color" name="sponsor_bg" defaultValue={settings?.sponsor_bg ?? "#151515"} className="h-11 w-full rounded-md border border-line bg-transparent" /></Field>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 font-medium">Google ads (AdSense)</h2>
          <p className="mb-4 text-sm text-muted">Paste your publisher ID once Google approves the site, then switch ads on.</p>
          <Field label="AdSense publisher ID"><input name="adsense_client" defaultValue={settings?.adsense_client ?? ""} className={inputCls} placeholder="ca-pub-XXXXXXXXXXXXXXXX" /></Field>
          <div className="mt-2"><Toggle name="ads_enabled" label="Show Google ads on the site" on={settings?.ads_enabled} /></div>
        </Card>

        <Card>
          <h2 className="mb-4 font-medium">Display options</h2>
          <Toggle name="show_view_counts" label="Show view counts to visitors" hint="The view count label on writings." on={settings?.show_view_counts} />
          <Toggle name="videos_on_home" label="Show latest videos on the homepage" on={settings?.videos_on_home} />
          <Toggle name="shorts_enabled" label="Enable the Shorts feed" on={settings?.shorts_enabled} />
        </Card>

        <Card>
          <h2 className="mb-2 font-medium">Viewer filter tags (up to 10)</h2>
          <p className="mb-4 text-sm text-muted">Comma-separated. A tag only shows publicly once a quote uses it. "All" is always shown.</p>
          <input name="allowed_tags" defaultValue={(settings?.allowed_tags ?? []).join(", ")} className={inputCls} placeholder="Love, Wisdom, Solitude" />
        </Card>

        <Card>
          <h2 className="mb-2 font-medium">Contact subjects</h2>
          <p className="mb-4 text-sm text-muted">The subjects visitors choose when writing to you (used to filter your inbox). Comma-separated.</p>
          <input name="contact_subjects" defaultValue={(settings?.contact_subjects ?? ["Discussion", "Sharing Thoughts", "Collab Requests"]).join(", ")} className={inputCls} placeholder="Discussion, Sharing Thoughts, Collab Requests" />
        </Card>

        <Card>
          <h2 className="mb-4 font-medium">Integrations</h2>
          <div className="space-y-4">
            <Field label="YouTube channel ID"><input name="youtube_channel_id" defaultValue={settings?.youtube_channel_id ?? ""} className={inputCls} placeholder="UC_lrBstHQdtQ8cHlFY0j6wQ" /></Field>
            <Field label="Spotify show ID"><input name="spotify_show_id" defaultValue={settings?.spotify_show_id ?? ""} className={inputCls} /></Field>
            <Field label="Pin a Spotify episode (blank = latest)"><input name="spotify_episode_id" defaultValue={settings?.spotify_episode_id ?? ""} className={inputCls} /></Field>
          </div>
        </Card>

        <input type="hidden" name="about_md" value={settings?.about_md ?? ""} />
        <PendingButton>Save settings</PendingButton>
      </form>
    </div>
  );
}
