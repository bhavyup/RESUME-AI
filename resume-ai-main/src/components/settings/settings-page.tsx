'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  User, 
  CreditCard, 
  Key, 
  AlertTriangle, 
  Shield,
  Sparkles,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { User as SupabaseUser } from "@supabase/supabase-js"
import { Profile } from "@/lib/types"
import Image from "next/image"

import { SecurityForm } from "./security-form"
import { ApiKeysForm } from "./api-keys-form"
import { SubscriptionSection } from "./subscription-section"
import { DangerZone } from "./danger-zone"

interface SettingsPageProps {
  user: SupabaseUser | null
  profile: Profile | null
  isProPlan: boolean
}

type TabId = 'account' | 'subscription' | 'api-keys' | 'danger'

const tabs = [
  { id: 'account' as TabId, label: 'Account', icon: User },
  { id: 'subscription' as TabId, label: 'Subscription', icon: CreditCard },
  { id: 'api-keys' as TabId, label: 'API Keys', icon: Key },
  { id: 'danger' as TabId, label: 'Danger Zone', icon: AlertTriangle },
]

export function SettingsPage({ user, profile, isProPlan }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>('account')

  const getInitials = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
    }
    return user?.email?.[0]?.toUpperCase() || 'U'
  }

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'User'

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account preferences and configurations</p>
      </div>

      {/* Profile Card */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800/50">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-slate-700 ring-offset-2 ring-offset-slate-950">
              {profile?.photo_url ? (
                <Image 
                  src={profile.photo_url} 
                  alt="Profile" 
                  width={80} 
                  height={80} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{getInitials()}</span>
                </div>
              )}
            </div>
            {isProPlan && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center ring-2 ring-slate-950">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">{displayName}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="mt-2 flex items-center gap-3">
              {isProPlan ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Sparkles className="w-3 h-3" />
                  Pro Plan
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Free Plan
                </span>
              )}
              <a 
                href="/profile" 
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                Edit Profile <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 mb-6 bg-slate-900/50 rounded-xl border border-slate-800/50 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap",
                isActive 
                  ? "text-white" 
                  : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSettingsTab"
                  className="absolute inset-0 bg-slate-800 rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon className={cn("w-4 h-4", tab.id === 'danger' && isActive && "text-red-400")} />
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'account' && (
          <div className="space-y-6">
            {/* Email & Password Section */}
            <div className="rounded-2xl bg-slate-900/50 border border-slate-800/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800/50">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Security
                </h3>
                <p className="text-sm text-slate-400 mt-1">Manage your email and password</p>
              </div>
              <div className="p-6">
                <SecurityForm user={user} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/50">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                Subscription
              </h3>
              <p className="text-sm text-slate-400 mt-1">Manage your plan and billing</p>
            </div>
            <div className="p-6">
              <SubscriptionSection />
            </div>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/50">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                API Keys
              </h3>
              <p className="text-sm text-slate-400 mt-1">Configure AI provider credentials</p>
            </div>
            <div className="p-6">
              <ApiKeysForm isProPlan={isProPlan} />
            </div>
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="rounded-2xl bg-red-950/20 border border-red-900/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-red-900/30">
              <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-red-400/70 mt-1">Irreversible actions</p>
            </div>
            <div className="p-6">
              <DangerZone />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
