import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { storage, STORAGE_KEYS } from "@/lib/utils/storage";
import SupportOrgSelector from "@/components/support/org-selector";
import { useEffect, useState } from "react";
import { searchOrganizations } from "@/lib/services/organization.service";
import type { Organization } from "@/lib/types/organization";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/onboarding/select-organization")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const pendingOrg =
    storage.get<string>(STORAGE_KEYS.PENDING_SUPPORT_ORG_SLUG) ?? "";
  const [query, setQuery] = useState<string>(pendingOrg);
  const [options, setOptions] = useState<Organization[]>([]);
  const [value, setValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!query) {
          setOptions([]);
          return;
        }
        const results = await searchOrganizations(query, 8);
        if (!cancelled) setOptions(results);
        const preselect = results.find(
          (o) => o.slug.toLowerCase() === pendingOrg.toLowerCase()
        );
        if (!cancelled && preselect) setValue(preselect.id);
      } catch {
        if (!cancelled) setOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, pendingOrg]);

  return (
    <main className="h-screen w-full flex justify-center items-center">
      <div className="flex flex-col gap-5 -mt-20 md:-mt-28 w-full px-4">
        <div className="flex gap-1 justify-center mb-4">
          <Logo className="h-8 w-auto" />
          <span className="text-2xl font-light tracking-wider">
            Hey<span className="text-lime-500 font-base">desk</span>
          </span>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-light">Select organization</h1>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-end align-middle gap-2">
            <div className="flex-1">
              <SupportOrgSelector
                organizations={options}
                value={value}
                onChange={setValue}
                onSearchChange={setQuery}
                placeholder="Search organizations"
              />
            </div>
            <div className="pb-[2px]">
              <Button
                size="icon"
                className="p-5 rounded-full"
                disabled={!value}
                aria-label="Continue"
                onClick={() => {
                  if (!value) return;
                  const selected = options.find((o) => o.id === value);
                  if (!selected) return;
                  navigate({
                    to: "/support/$org",
                    params: { org: selected.slug },
                  });
                }}
              >
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
