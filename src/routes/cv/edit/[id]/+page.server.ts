import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, parent }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		throw redirect(303, '/');
	}

	const parentData = await parent();

	if (!parentData.profile?.is_verified) {
		throw redirect(303, '/dashboard');
	}

	const { data: document, error: dbError } = await locals.supabase
		.from('cv_documents')
		.select('*')
		.eq('id', params.id)
		.eq('user_id', user.id)
		.single();

	if (dbError || !document) {
		throw error(404, 'CV tidak ditemukan');
	}

	return {
		document
	};
};
