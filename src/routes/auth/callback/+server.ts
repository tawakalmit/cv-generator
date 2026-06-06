import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			// Check if profile exists, if not create one
			const { data: { user } } = await locals.supabase.auth.getUser();
			if (user) {
				const { data: existingProfile } = await locals.supabase
					.from('profiles')
					.select('id')
					.eq('id', user.id)
					.single();

				if (!existingProfile) {
					await locals.supabase.from('profiles').insert({
						id: user.id,
						email: user.email,
						full_name: user.user_metadata?.full_name || '',
						avatar_url: user.user_metadata?.avatar_url || '',
						is_verified: false
					});
				}
			}
			throw redirect(303, '/dashboard');
		}
	}

	throw redirect(303, '/');
};
