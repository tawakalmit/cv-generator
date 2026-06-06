<script lang="ts">
	interface Props {
		selected: string;
		onSelect: (template: string) => void;
	}

	let { selected, onSelect }: Props = $props();

	const templates: { id: string; name: string; description: string; color: string; preview: string }[] = [
		{
			id: 'professional',
			name: 'Professional',
			description: 'Layout bersih, rapi, dan simetris. Cocok untuk semua industri.',
			color: '#2563eb',
			preview: 'bg-gradient-to-br from-blue-500 to-blue-700'
		},
		{
			id: 'elegant',
			name: 'Elegant',
			description: 'Desain elegan dengan sidebar gelap dan tipografi serif.',
			color: '#1e293b',
			preview: 'bg-gradient-to-br from-slate-700 to-slate-900'
		},
		{
			id: 'vibrant',
			name: 'Vibrant',
			description: 'Warna-warni cerah dengan aksen hijau emerald yang segar.',
			color: '#059669',
			preview: 'bg-gradient-to-br from-emerald-400 to-teal-600'
		},
		{
			id: 'minimal',
			name: 'Minimal',
			description: 'Sangat minimalis, tanpa warna berlebih. Fokus pada konten.',
			color: '#6b7280',
			preview: 'bg-gradient-to-br from-gray-300 to-gray-500'
		},
		{
			id: 'bold',
			name: 'Bold',
			description: 'Berani dan modern dengan header gradient dan layout tegas.',
			color: '#7c3aed',
			preview: 'bg-gradient-to-br from-violet-500 to-purple-700'
		},
		{
			id: 'classic-sidebar',
			name: 'Classic Sidebar',
			description: 'Layout dua kolom dengan sidebar gelap, foto besar, dan tipografi klasik.',
			color: '#1e3a5f',
			preview: 'bg-gradient-to-br from-sky-900 to-slate-800'
		}
	];
</script>

<div class="space-y-4">
	<h2 class="text-2xl font-bold text-center mb-6">Pilih Template CV</h2>
	{#if templates.length === 0}
		<p class="text-center text-base-content/50">Belum ada template tersedia.</p>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each templates as template}
				<button
					class="card bg-base-100 shadow-xl cursor-pointer transition-all hover:scale-105 {selected === template.id ? 'ring-4 ring-primary ring-offset-2' : ''}"
					onclick={() => onSelect(template.id)}
				>
					<figure class="px-4 pt-4">
						<div class="w-full h-48 rounded-lg {template.preview} flex items-center justify-center">
							<div class="bg-white/20 backdrop-blur-sm rounded-lg p-4 w-3/4 h-3/4 flex flex-col justify-center items-center">
								<div class="w-full space-y-2">
									<div class="h-3 bg-white/60 rounded w-2/3 mx-auto"></div>
									<div class="h-2 bg-white/40 rounded w-1/2 mx-auto"></div>
									<div class="h-1 bg-white/30 rounded w-full mt-4"></div>
									<div class="h-1 bg-white/30 rounded w-full"></div>
									<div class="h-1 bg-white/30 rounded w-3/4"></div>
								</div>
							</div>
						</div>
					</figure>
					<div class="card-body items-center text-center p-4">
						<h3 class="card-title text-lg">{template.name}</h3>
						<p class="text-sm text-base-content/70">{template.description}</p>
						{#if selected === template.id}
							<div class="badge badge-primary">Dipilih</div>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>
