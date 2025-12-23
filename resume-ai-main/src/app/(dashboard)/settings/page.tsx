import { SettingsPage } from '@/components/settings/settings-page'
import { checkSubscriptionPlan } from '@/utils/actions/stripe/actions';
import { createClient } from '@/utils/supabase/server'

export default async function SettingsRoute() {
  const supabase = await createClient();
  
  const [{ data: { user } }, subscription] = await Promise.all([
    supabase.auth.getUser(),
    checkSubscriptionPlan()
  ]);

  // Fetch user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user?.id)
    .single();

  const isProPlan = subscription.plan === 'pro';

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      <main className="relative z-10 py-8 px-4 md:px-8 pb-32">
        <SettingsPage 
          user={user} 
          profile={profile}
          isProPlan={isProPlan}
        />
      </main>
    </div>
  )
}