<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';

	let { data } = $props();

	function startCreateCV() {
		goto('/cv/create');
	}

	function editCV(id: string) {
		goto(`/cv/edit/${id}`);
	}

	async function deleteCV(id: string) {
		if (!confirm('Yakin ingin menghapus CV ini?')) return;

		const res = await fetch(`/api/cv/${id}`, { method: 'DELETE' });
		if (res.ok) {
			await invalidateAll();
		}
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="navbar bg-base-100 shadow-lg">
	<div class="flex-1">
		<a href="/dashboard" class="btn btn-ghost text-xl">CV Generator</a>
	</div>
	<div class="flex-none gap-2">
		<div class="dropdown dropdown-end">
			<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
				<div class="w-10 rounded-full">
					<img alt="Avatar" src={data.profile?.avatar_url || 'https://ui-avatars.com/api/?name=User'} />
				</div>
			</div>
			<ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
				<li><span class="font-semibold">{data.profile?.full_name || 'User'}</span></li>
				<li>
					<form method="POST" action="/auth/logout">
						<button type="submit" class="w-full text-left">Logout</button>
					</form>
				</li>
			</ul>
		</div>
	</div>
</div>

<div class="container mx-auto p-6">
	{#if !data.profile?.is_verified}
		<div class="alert alert-warning shadow-lg mb-6">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
			</svg>
			<div>
				<h3 class="font-bold">Akun Belum Terverifikasi</h3>
				<p>Akun Anda belum diverifikasi oleh admin. Silakan hubungi admin untuk verifikasi akun.</p>
			</div>
		</div>
	{:else}
		<div class="flex justify-between items-center mb-8">
			<div>
				<h2 class="text-3xl font-bold">Selamat Datang, {data.profile?.full_name}!</h2>
				<p class="text-base-content/70 mt-1">Kelola CV profesional Anda di sini.</p>
			</div>
			<button class="btn btn-primary gap-2" onclick={startCreateCV}>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Buat CV Baru
			</button>
		</div>

		{#if data.documents.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each data.documents as doc}
					<div class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
						<div class="card-body p-5">
							<h3 class="card-title text-lg">{doc.title}</h3>
							<p class="text-sm text-base-content/60">
								Template: <span class="badge badge-sm badge-outline capitalize">{doc.template}</span>
							</p>
							<p class="text-xs text-base-content/50">
								Terakhir diubah: {formatDate(doc.updated_at)}
							</p>
							<div class="card-actions justify-end mt-3">
								<button class="btn btn-sm btn-ghost text-error" onclick={() => deleteCV(doc.id)}>Hapus</button>
								<button class="btn btn-sm btn-primary" onclick={() => editCV(doc.id)}>Edit</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<p class="text-base-content/50 text-lg">Belum ada CV yang tersimpan.</p>
				<p class="text-base-content/40 text-sm mt-1">Klik "Buat CV Baru" untuk mulai.</p>
			</div>
		{/if}
	{/if}
</div>
