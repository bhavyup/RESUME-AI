'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { useFormStatus } from 'react-dom'
import { deleteUserAccount } from "@/app/auth/login/actions"

interface DangerZoneProps {
  subscriptionStatus?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <AlertDialogAction
      type="submit"
      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      disabled={pending}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Delete Account
    </AlertDialogAction>
  )
}

export function DangerZone({ subscriptionStatus }: DangerZoneProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-950/30 border border-red-900/30">
        <div>
          <h3 className="font-medium text-red-400">Delete Account</h3>
          <p className="text-sm text-red-400/60 mt-1">
            Permanently delete your account and all of your data. This action cannot be undone.
          </p>
          {subscriptionStatus === 'active' && (
            <p className="text-sm text-amber-400 mt-2">
              ⚠️ You have an active subscription. Please cancel it first.
            </p>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white shrink-0"
              disabled={subscriptionStatus === 'active'}
            >
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-slate-900 border-slate-800">
            <form action={deleteUserAccount}>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-slate-200">Type &ldquo;DELETE&rdquo; to confirm</Label>
                  <Input
                    id="confirm"
                    name="confirm"
                    placeholder="DELETE"
                    className="bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white">Cancel</AlertDialogCancel>
                <SubmitButton />
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
} 