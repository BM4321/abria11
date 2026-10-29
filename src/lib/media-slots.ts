import { solutions } from "@/lib/site";

// Every image slot on the public site that an admin can fill from the media
// library. `path` is the page to revalidate when the slot's image changes.

export type MediaSlot = {
  id: string;
  label: string;
  path: string;
  aspect: string;
};

export const MEDIA_SLOTS: MediaSlot[] = [
  { id: "home.hero", label: "Home — hero photo", path: "/", aspect: "4/5" },
  { id: "for-shippers.hero", label: "For Businesses — hero photo", path: "/for-shippers", aspect: "5/4" },
  { id: "register-truck.hero", label: "Register Truck — hero photo", path: "/register-truck", aspect: "16/10" },
  ...solutions.map((s) => ({
    id: `solution.${s.id}`,
    label: `Solution: ${s.name} — hero photo`,
    path: s.href,
    aspect: "5/4",
  })),
];

export function mediaSlot(id: string): MediaSlot | undefined {
  return MEDIA_SLOTS.find((s) => s.id === id);
}
