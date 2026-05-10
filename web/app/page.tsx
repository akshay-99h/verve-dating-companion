import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

import StoryScrollDemo from "@/components/ui/story-scroll-demo";

export default async function MarketingPage() {
  const { user } = await withAuth();

  if (user) {
    redirect("/app");
  }

  return <StoryScrollDemo />;
}
