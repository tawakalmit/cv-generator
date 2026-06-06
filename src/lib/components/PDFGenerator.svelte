<script lang="ts">
	import type { CVData } from '$lib/types';
	import { generatePDF } from '$lib/pdf/generator';

	interface Props {
		data: CVData;
		template: string;
	}

	let { data, template }: Props = $props();

	let isGenerating = $state(false);
	let errorMessage = $state('');

	async function handleGenerate() {
		// Validate required fields
		if (!data.personalInfo.fullName || !data.personalInfo.email || !data.personalInfo.phone) {
			errorMessage = 'Mohon isi nama lengkap, email, dan telepon terlebih dahulu.';
			return;
		}

		errorMessage = '';
		isGenerating = true;

		try {
			await generatePDF(data, template);
		} catch (error) {
			errorMessage = 'Terjadi kesalahan saat membuat PDF. Silakan coba lagi.';
			console.error(error);
		} finally {
			isGenerating = false;
		}
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body items-center text-center">
		<h2 class="card-title text-2xl mb-4">Generate CV Anda</h2>
		
		<div class="bg-base-200 rounded-lg p-6 w-full max-w-md">
			<div class="space-y-2 text-left">
				<p><strong>Nama:</strong> {data.personalInfo.fullName || '-'}</p>
				<p><strong>Email:</strong> {data.personalInfo.email || '-'}</p>
				<p><strong>Template:</strong> <span class="badge badge-primary capitalize">{template}</span></p>
				<p><strong>Pendidikan:</strong> {data.education.length} entri</p>
				<p><strong>Pengalaman:</strong> {data.experience.length} entri</p>
				<p><strong>Keahlian:</strong> {data.skills.length} item</p>
			</div>
		</div>

		{#if errorMessage}
			<div class="alert alert-error mt-4">
				<span>{errorMessage}</span>
			</div>
		{/if}

		<button
			class="btn btn-primary btn-lg mt-6 gap-2"
			onclick={handleGenerate}
			disabled={isGenerating}
		>
			{#if isGenerating}
				<span class="loading loading-spinner"></span>
				Generating...
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				Download PDF
			{/if}
		</button>
	</div>
</div>
