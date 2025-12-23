'use client'

import React, { useState } from "react"
import Image from "next/image"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Crown, ArrowRight } from "lucide-react"
import Link from "next/link"
import {
  getModelById,
  getProviderById,
  isModelAvailable,
  groupModelsByProvider,
  type AIModel,
  type ApiKey
} from '@/lib/ai-models'

interface ModelSelectorProps {
  value: string
  onValueChange: (value: string) => void
  apiKeys: ApiKey[]
  isProPlan: boolean
  className?: string
  placeholder?: string
  showToast?: boolean
}

// Helper component for unavailable model popover
function UnavailableModelPopover({ children, model }: { children: React.ReactNode; model: AIModel }) {
  const [open, setOpen] = useState(false)
  const provider = getProviderById(model.provider)
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="w-full"
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 z-50 bg-slate-900 border-slate-700" 
        side="right" 
        align="start"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-slate-100">
              {model.name} is not available
            </h4>
            <p className="text-xs text-slate-400">
              To use this model, you need either a Pro subscription or a {provider?.name} API key.
            </p>
          </div>
          
          <div className="space-y-2">
            {/* Pro Option */}
            <div className="p-3 rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">Recommended</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  Instant Access
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Get unlimited access to all AI models without managing API keys
              </p>
              <Link href="/subscription">
                <Button size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white h-7 text-xs">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>

            {/* API Key Option */}
            <div className="p-3 rounded-lg border border-slate-700 bg-slate-800/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-slate-300">Alternative</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Add your own {provider?.name} API key to use this model
              </p>
              <div className="flex gap-2">
                <Link href="/settings" className="flex-1">
                  <Button size="sm" variant="outline" className="w-full h-7 text-xs border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100">
                    Configure API Key
                  </Button>
                </Link>
                {provider?.apiLink && (
                  <Link href={provider.apiLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800">
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function ModelSelector({ 
  value, 
  onValueChange, 
  apiKeys, 
  isProPlan, 
  className,
  placeholder = "Select an AI model",
  showToast = true
}: ModelSelectorProps) {
  
  const isModelSelectable = (modelId: string) => {
    return isModelAvailable(modelId, isProPlan, apiKeys)
  }

  const handleModelChange = (modelId: string) => {
    const selectedModel = getModelById(modelId)
    if (!selectedModel) return

    // Check if model is available for the user
    if (!isModelAvailable(modelId, isProPlan, apiKeys)) {
      if (showToast) {
        const provider = getProviderById(selectedModel.provider)
        toast.error(`Please add your ${provider?.name || selectedModel.provider} API key first`)
      }
      return
    }

    onValueChange(modelId)
    if (showToast) {
      toast.success('Model updated successfully')
    }
  }

  // Use the centralized grouping function
  const getModelsByProvider = () => groupModelsByProvider()

  return (
    <Select value={value} onValueChange={handleModelChange}>
      <SelectTrigger className={cn(
        "bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 focus:border-emerald-500/50 transition-colors outline-none text-slate-200",
        className
      )}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="min-w-[300px] max-w-[400px] bg-slate-900 border-slate-700">
        {getModelsByProvider().map((group, groupIndex) => (
          <div key={group.provider}>
            <SelectGroup>
              <SelectLabel className="text-xs font-semibold text-slate-400 px-2 py-1.5">
                <div className="flex items-center gap-2">
                  {getProviderById(group.provider)?.logo && (
                    <Image
                      src={getProviderById(group.provider)!.logo!}
                      alt={`${group.name} logo`}
                      width={14}
                      height={14}
                      className="rounded-sm"
                    />
                  )}
                  {group.name}
                </div>
              </SelectLabel>
              {group.models.map((model) => {
                const provider = getProviderById(model.provider)
                const isSelectable = isModelSelectable(model.id)
                const logoSrc = model.logo || provider?.logo
                
                const selectItem = (
                  <SelectItem 
                    key={model.id} 
                    value={model.id}
                    disabled={!isSelectable}
                    className={cn(
                      "transition-colors text-slate-200",
                      !isSelectable ? 'opacity-50' : 'hover:bg-slate-800 focus:bg-slate-800'
                    )}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {logoSrc && (
                        <Image
                          src={logoSrc}
                          alt={`${model.name} logo`}
                          width={16}
                          height={16}
                          className="rounded-sm flex-shrink-0"
                        />
                      )}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="truncate font-medium">{model.name}</span>
                        {model.features.isRecommended && value !== model.id && (
                          <span className="text-teal-300 bg-teal-500/20 border border-teal-500/30 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0">
                            Recommended
                          </span>
                        )}
                        {model.features.isFree && (
                          <span className="text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0">
                            Free
                          </span>
                        )}
                        {model.features.isUnstable && (
                          <span className="text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0">
                            Unstable
                          </span>
                        )}
                      </div>
                      {!isSelectable && (
                        <span className="ml-1.5 text-slate-500 flex-shrink-0">(No API Key set)</span>
                      )}
                    </div>
                  </SelectItem>
                )

                // Wrap unavailable models with popover
                if (!isSelectable) {
                  return (
                    <UnavailableModelPopover key={model.id} model={model}>
                      {selectItem}
                    </UnavailableModelPopover>
                  )
                }

                return selectItem
              })}
            </SelectGroup>
            {groupIndex < getModelsByProvider().length - 1 && (
              <SelectSeparator className="bg-slate-700" />
            )}
          </div>
        ))}
      </SelectContent>
    </Select>
  )
}

// Re-export types from centralized location
export type { AIModel, ApiKey } from '@/lib/ai-models' 