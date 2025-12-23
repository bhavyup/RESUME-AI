import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('subscription_plan, subscription_status, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({
      subscription_plan: subscription?.subscription_plan || 'free',
      subscription_status: subscription?.subscription_status || 'active',
      current_period_end: subscription?.current_period_end || null,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ 
      subscription_plan: 'free',
      subscription_status: 'active',
    });
  }
}
