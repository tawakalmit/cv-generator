import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { session } = await locals.safeGetSession();

	if (!session) {
		throw redirect(303, '/');
	}

	const parentData = await parent();

	if (!parentData.profile?.is_verified) {
		throw redirect(303, '/dashboard');
	}

	return {};
};
