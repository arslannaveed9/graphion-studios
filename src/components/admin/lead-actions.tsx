import { deleteLeadAction, markLeadSpamAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function LeadActions({
  id,
  status,
  redirectTo,
}: {
  id: string;
  status: string;
  redirectTo: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {status !== "spam" ? (
        <form action={markLeadSpamAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button type="submit" variant="outline" size="sm" className="rounded-none">
            Mark as spam
          </Button>
        </form>
      ) : null}
      <form action={deleteLeadAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Button type="submit" variant="ghost" size="sm" className="rounded-none text-destructive">
          Delete
        </Button>
      </form>
    </div>
  );
}
