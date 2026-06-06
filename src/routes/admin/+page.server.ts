import { ADMIN_USERNAME, ADMIN_PASSWORD } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
	const adminSession = cookies.get('admin_session');

	if (adminSession !== 'authenticated') {
		return { authenticated: false, users: [] };
	}

	// Fetch all users
	const { data: users, error } = await locals.supabase
		.from('profiles')
		.select('*')
		.order('created_at', { ascending: false });

	return {
		authenticated: true,
		users: users || []
	};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;

		if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
			cookies.set('admin_session', 'authenticated', {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 8 // 8 hours
			});
			return { success: true };
		}

		return fail(401, { error: 'Username atau password salah' });
	},

	logout: async ({ cookies }) => {
		cookies.delete('admin_session', { path: '/' });
		throw redirect(303, '/admin');
	},

	verify: async ({ request, locals, cookies }) => {
		const adminSession = cookies.get('admin_session');
		if (adminSession !== 'authenticated') {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const verified = formData.get('verified') === 'true';

		const { error } = await locals.supabase
			.from('profiles')
			.update({ is_verified: verified })
			.eq('id', userId);

		if (error) {
			return fail(500, { error: 'Gagal mengupdate status verifikasi' });
		}

		return { success: true };
	}
};
