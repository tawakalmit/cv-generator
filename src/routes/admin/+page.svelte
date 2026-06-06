<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

{#if !data.authenticated}
	<!-- Login Form -->
	<div class="hero min-h-screen">
		<div class="hero-content">
			<div class="card w-full max-w-sm shadow-2xl bg-base-100">
				<div class="card-body">
					<h2 class="card-title text-2xl justify-center mb-4">Admin Login</h2>
					{#if form?.error}
						<div class="alert alert-error mb-4">
							<span>{form.error}</span>
						</div>
					{/if}
					<form method="POST" action="?/login" use:enhance>
						<div class="form-control">
							<label class="label" for="username">
								<span class="label-text">Username</span>
							</label>
							<input id="username" name="username" type="text" placeholder="Username" class="input input-bordered" required />
						</div>
						<div class="form-control mt-4">
							<label class="label" for="password">
								<span class="label-text">Password</span>
							</label>
							<input id="password" name="password" type="password" placeholder="Password" class="input input-bordered" required />
						</div>
						<div class="form-control mt-6">
							<button type="submit" class="btn btn-primary">Login</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
{:else}
	<!-- Admin Dashboard -->
	<div class="navbar bg-base-100 shadow-lg">
		<div class="flex-1">
			<span class="text-xl font-bold px-4">Admin Dashboard</span>
		</div>
		<div class="flex-none">
			<form method="POST" action="?/logout" use:enhance>
				<button type="submit" class="btn btn-ghost btn-sm">Logout</button>
			</form>
		</div>
	</div>

	<div class="container mx-auto p-6">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-2xl mb-4">Manajemen Pengguna</h2>
				<p class="text-base-content/70 mb-4">Total pengguna: {data.users.length}</p>

				<div class="overflow-x-auto">
					<table class="table table-zebra">
						<thead>
							<tr>
								<th>Avatar</th>
								<th>Nama</th>
								<th>Email</th>
								<th>Terdaftar</th>
								<th>Status</th>
								<th>Aksi</th>
							</tr>
						</thead>
						<tbody>
							{#each data.users as user}
								<tr>
									<td>
										<div class="avatar">
											<div class="w-10 rounded-full">
												<img src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}`} alt="Avatar" />
											</div>
										</div>
									</td>
									<td class="font-medium">{user.full_name || '-'}</td>
									<td>{user.email}</td>
									<td>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
									<td>
										{#if user.is_verified}
											<span class="badge badge-success">Verified</span>
										{:else}
											<span class="badge badge-warning">Pending</span>
										{/if}
									</td>
									<td>
										<form method="POST" action="?/verify" use:enhance>
											<input type="hidden" name="userId" value={user.id} />
											<input type="hidden" name="verified" value={user.is_verified ? 'false' : 'true'} />
											{#if user.is_verified}
												<button type="submit" class="btn btn-sm btn-warning">Unverify</button>
											{:else}
												<button type="submit" class="btn btn-sm btn-success">Verify</button>
											{/if}
										</form>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				{#if data.users.length === 0}
					<div class="text-center py-8 text-base-content/50">
						<p>Belum ada pengguna yang terdaftar.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
