import type { Session, SupabaseClient } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{ session: Session | null; user: any | null }>;
			session: Session | null;
			user: any | null;
		}
		interface PageData {
			session: Session | null;
			user: any | null;
		}
	}
}

export {};
