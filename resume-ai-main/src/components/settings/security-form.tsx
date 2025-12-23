'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { User } from "@supabase/supabase-js"
import { useState } from "react"
import { updateEmail, updatePassword } from "@/app/(dashboard)/settings/actions"
import { toast } from "sonner"
// import { testApiKey } from "@/app/settings/page"

interface SecurityFormProps {
  user: User | null;
}

export function SecurityForm({ user }: SecurityFormProps) {
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleEmailUpdate = async () => {
    try {
      setIsUpdatingEmail(true);
      const formData = new FormData();
      formData.append('email', newEmail);
      formData.append('currentPassword', emailCurrentPassword);
      
      const result = await updateEmail(formData);
      
      if (!result.success) {
        toast.error(result.error || "Failed to update email");
        return;
      }
      
      toast.success("Please check your new email to confirm the change");
      setNewEmail("");
      setEmailCurrentPassword("");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      setIsUpdatingPassword(true);
      const formData = new FormData();
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
      
      const result = await updatePassword(formData);
      
      if (!result.success) {
        toast.error(result.error || "Failed to update password");
        return;
      }
      
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Change Section */}
      <div className="space-y-3">
        <div>
          <Label className="text-slate-200 text-sm font-medium">Email Address</Label>
          <p className="text-xs text-slate-500 mt-0.5">Current: {user?.email}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="New email address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-500 h-10"
          />
          <Input
            type="password"
            placeholder="Current password"
            value={emailCurrentPassword}
            onChange={(e) => setEmailCurrentPassword(e.target.value)}
            className="bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-500 h-10"
          />
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 whitespace-nowrap"
            onClick={handleEmailUpdate}
            disabled={isUpdatingEmail || !newEmail || !emailCurrentPassword}
          >
            {isUpdatingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdatingEmail ? "Updating..." : "Update Email"}
          </Button>
        </div>
      </div>

      <div className="h-px bg-slate-800" />

      {/* Password Reset Section */}
      <div className="space-y-3">
        <div>
          <Label className="text-slate-200 text-sm font-medium">Password</Label>
          <p className="text-xs text-slate-500 mt-0.5">Change your account password</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-500 h-10"
          />
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-slate-950/50 border-slate-800 text-slate-200 placeholder:text-slate-500 h-10"
          />
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 whitespace-nowrap"
            onClick={handlePasswordUpdate}
            disabled={isUpdatingPassword || !currentPassword || !newPassword}
          >
            {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUpdatingPassword ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  )
} 