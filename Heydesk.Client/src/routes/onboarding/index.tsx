import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useId } from "react";
import { Building2, AtSign } from "lucide-react";

export const Route = createFileRoute("/onboarding/")({
  component: RouteComponent,
});

function RouteComponent() {
  const nameId = useId();
  const slugId = useId();
  const websiteId = useId();

  return (
    <main className="h-screen w-full flex justify-center items-center">
      <div className="flex flex-col gap-8 -mt-6 md:-mt-10">
        <div className="flex gap-1 justify-center">
          <Link to="/" className="flex gap-1 items-center" aria-label="Home">
            <Logo className="h-8 w-auto" />
            <span className="text-2xl font-light tracking-wider">
              Hey<span className="text-lime-500 font-base">desk</span>
            </span>
          </Link>
        </div>

        <Card className="min-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-light">
              Create your organization
            </CardTitle>
            <CardDescription>
              Set up your workspace to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {/* Organization Name */}
            <div className="relative">
              <Label htmlFor={nameId} className="sr-only">
                Organization name
              </Label>
              <Input
                id={nameId}
                className="peer pe-9"
                placeholder="Organization name"
                type="text"
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                <Building2 size={16} aria-hidden="true" />
              </div>
            </div>

            {/* Slug */}
            <div className="relative">
              <Label htmlFor={slugId} className="sr-only">
                Slug
              </Label>
              <Input
                id={slugId}
                className="peer pe-9"
                placeholder="your-company"
                type="text"
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
                <AtSign size={16} aria-hidden="true" />
              </div>
            </div>

            {/* Website with start inline add-on */}
            <div className="relative">
              <Label htmlFor={websiteId} className="sr-only">
                Website
              </Label>
              <Input
                id={websiteId}
                className="peer ps-16"
                placeholder="your-website.com"
                type="text"
              />
              <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
                https://
              </span>
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full">Continue</Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
