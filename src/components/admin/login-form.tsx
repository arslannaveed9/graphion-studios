"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";

export function LoginForm({ from }: { from?: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <div className="surface relative mx-auto w-full max-w-md p-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Logo />
      <h1 className="mt-8 text-4xl">Studio access</h1>
      <p className="mt-2 text-sm text-muted-foreground">CMS for Graphion Studios.</p>
      <form action={action} className="mt-8 space-y-4">
        <input type="hidden" name="from" value={from || "/admin"} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required className="rounded-xl" />
        </div>
        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        <Button type="submit" disabled={pending} className="h-11 w-full rounded-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
