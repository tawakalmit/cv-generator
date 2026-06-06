import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET: List all CV documents for the user
export const GET: RequestHandler = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { data, error } = await locals.supabase
		.from('cv_documents')
		.select('id, title, template, updated_at, created_at')
		.eq('user_id', user.id)
		.order('updated_at', { ascending: false });

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json({ documents: data });
};

// POST: Create a new CV document
export const POST: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();
	const { title, template, data: cvData } = body;

	const { data, error } = await locals.supabase
		.from('cv_documents')
		.insert({
			user_id: user.id,
			title: title || 'CV Tanpa Judul',
			template: template || 'modern',
			data: cvData || {}
		})
		.select()
		.single();

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json({ document: data }, { status: 201 });
};
