import { updateProfile } from "@/app/dashboard/actions";
import { AvatarUpload } from "@/components/Upload";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  tagline: string;
  bio: string | null;
  city: string;
  country: string;
  phone_e164: string;
  email_public: string | null;
  template: string;
  avatar_url: string | null;
}

interface TabSettingsProps {
  profile: Profile;
}

export function TabSettings({ profile }: TabSettingsProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <h2 className="font-semibold font-display text-sm text-gray-900">Parametres du profil</h2>
      <div className="mt-3">
        <AvatarUpload profileId={profile.id} currentUrl={profile.avatar_url} />
      </div>
      <form action={updateProfile} className="mt-4 flex flex-col gap-3">
        <input name="display_name" defaultValue={profile.display_name} required placeholder="Nom" className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
        <input name="tagline" defaultValue={profile.tagline} required placeholder="Tagline" className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
        <textarea name="bio" defaultValue={profile.bio || ""} placeholder="Bio (280c)" maxLength={280} className="rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-gray-900 resize-none" rows={3} />
        <div className="flex gap-3">
          <input name="city" defaultValue={profile.city} required placeholder="Ville" className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
          <input name="country" defaultValue={profile.country} required placeholder="CI" className="w-20 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
        </div>
        <input name="phone_e164" defaultValue={profile.phone_e164} required placeholder="+2250700000000" className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
        <input name="email_public" defaultValue={profile.email_public || ""} placeholder="Email public (optionnel)" className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
        <select name="template" defaultValue={profile.template} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
          <option value="minimal">Minimal</option>
          <option value="portfolio">Portfolio</option>
        </select>
        <button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#EA580C] transition">
          Enregistrer
        </button>
      </form>
    </div>
  );
}
