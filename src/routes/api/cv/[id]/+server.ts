import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET: Get a single CV document
export const GET: RequestHandler = async ({ params, locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { data, error } = await locals.supabase
		.from('cv_documents')
		.select('*')
		.eq('id', params.id)
		.eq('user_id', user.id)
		.single();

	if (error) {
		return json({ error: 'Document not found' }, { status: 404 });
	}

	return json({ document: data });
};

// PUT: Update a CV document
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const body = await request.json();
	const { title, template, data: cvData } = body;

	const updateFields: Record<string, any> = {};
	if (title !== undefined) updateFields.title = title;
	if (template !== undefined) updateFields.template = template;
	if (cvData !== undefined) updateFields.data = cvData;

	const { data, error } = await locals.supabase
		.from('cv_documents')
		.update(updateFields)
		.eq('id', params.id)
		.eq('user_id', user.id)
		.select()
		.single();

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json({ document: data });
};

// DELETE: Delete a CV document
export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { error } = await locals.supabase
		.from('cv_documents')
		.delete()
		.eq('id', params.id)
		.eq('user_id', user.id);

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json({ success: true });
};
