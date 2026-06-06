import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session) {
		throw redirect(303, '/');
	}

	const parentData = await parent();

	// Fetch user's saved CV documents
	let documents: any[] = [];
	if (parentData.profile?.is_verified && user) {
		const { data } = await locals.supabase
			.from('cv_documents')
			.select('id, title, template, updated_at, created_at')
			.eq('user_id', user.id)
			.order('updated_at', { ascending: false });
		documents = data || [];
	}

	return {
		profile: parentData.profile,
		documents
	};
};
