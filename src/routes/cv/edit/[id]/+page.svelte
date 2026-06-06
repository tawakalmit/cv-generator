<script lang="ts">
	import { goto } from '$app/navigation';
	import type { CVData } from '$lib/types';
	import TemplateSelector from '$lib/components/TemplateSelector.svelte';
	import CVForm from '$lib/components/CVForm.svelte';
	import PDFGenerator from '$lib/components/PDFGenerator.svelte';

	let { data } = $props();

	let step = $state(1);
	let selectedTemplate = $state(data.document.template || 'professional');
	let saving = $state(false);
	let lastSaved = $state<string | null>(null);
	let saveTimeout: ReturnType<typeof setTimeout>;

	let cvData: CVData = $state(data.document.data as CVData || {
		personalInfo: {
			fullName: '',
			email: '',
			phone: '',
			address: '',
			linkedin: '',
			website: '',
			summary: '',
			photo: ''
		},
		education: [],
		experience: [],
		skills: [],
		languages: [],
		certifications: []
	});

	// Seed function - jalankan seedCV() di browser console untuk isi dummy data
	function seedCV() {
		cvData = {
			personalInfo: {
				fullName: 'Budi Santoso',
				email: 'budi.santoso@gmail.com',
				phone: '+62 812 9876 5432',
				address: 'Jakarta Selatan, Indonesia',
				linkedin: 'https://linkedin.com/in/budisantoso',
				website: 'https://budisantoso.dev',
				summary: 'Full-stack developer dengan pengalaman 5+ tahun dalam membangun aplikasi web modern. Berpengalaman dalam JavaScript/TypeScript, React, Node.js, dan cloud infrastructure. Passionate dalam clean code, scalable architecture, dan mentoring junior developer.',
				photo: ''
			},
			education: [
				{
					id: crypto.randomUUID(),
					institution: 'Universitas Indonesia',
					degree: 'S1',
					field: 'Teknik Informatika',
					startDate: '2015-08',
					endDate: '2019-07',
					gpa: '3.82'
				},
				{
					id: crypto.randomUUID(),
					institution: 'SMA Negeri 1 Jakarta',
					degree: 'SMA',
					field: 'IPA',
					startDate: '2012-07',
					endDate: '2015-06',
					gpa: ''
				}
			],
			experience: [
				{
					id: crypto.randomUUID(),
					company: 'PT Tokopedia (GoTo)',
					position: 'Senior Frontend Engineer',
					startDate: '2022-03',
					endDate: '',
					current: true,
					description: 'Memimpin tim frontend 5 orang untuk pengembangan fitur marketplace. Meningkatkan performa halaman produk sebesar 40% melalui optimasi bundle dan lazy loading. Implementasi design system yang digunakan oleh 20+ tim internal.'
				},
				{
					id: crypto.randomUUID(),
					company: 'PT Bukalapak.com',
					position: 'Frontend Developer',
					startDate: '2020-01',
					endDate: '2022-02',
					current: false,
					description: 'Mengembangkan fitur pembayaran dan checkout menggunakan React dan TypeScript. Menulis unit test dengan coverage 85%+. Berkolaborasi dengan tim product dan design untuk menghasilkan UX yang optimal.'
				},
				{
					id: crypto.randomUUID(),
					company: 'PT Startup Digital',
					position: 'Junior Web Developer',
					startDate: '2019-08',
					endDate: '2019-12',
					current: false,
					description: 'Membangun landing page dan dashboard admin menggunakan Vue.js. Integrasi REST API dan implementasi responsive design.'
				}
			],
			skills: [
				'JavaScript', 'TypeScript', 'React', 'Next.js', 'Svelte',
				'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Git',
				'Tailwind CSS', 'GraphQL', 'Redis', 'CI/CD'
			],
			languages: [
				{ id: crypto.randomUUID(), name: 'Indonesia', proficiency: 'Native' },
				{ id: crypto.randomUUID(), name: 'Inggris', proficiency: 'Fluent' },
				{ id: crypto.randomUUID(), name: 'Jepang', proficiency: 'Basic' }
			],
			certifications: [
				{
					id: crypto.randomUUID(),
					name: 'AWS Certified Solutions Architect',
					issuer: 'Amazon Web Services',
					date: '2023-06'
				},
				{
					id: crypto.randomUUID(),
					name: 'Google Professional Cloud Developer',
					issuer: 'Google Cloud',
					date: '2022-11'
				}
			]
		};
		debouncedSave();
		console.log('✅ CV data filled with dummy data!');
	}

	// Expose to window for browser console access
	if (typeof window !== 'undefined') {
		(window as any).seedCV = seedCV;
	}

	function nextStep() {
		if (step < 3) step++;
	}

	function prevStep() {
		if (step > 1) step--;
	}

	function onTemplateSelect(template: string) {
		selectedTemplate = template;
		autoSave();
	}

	function onFormUpdate(updatedData: CVData) {
		cvData = updatedData;
		debouncedSave();
	}

	function debouncedSave() {
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => autoSave(), 1500);
	}

	async function autoSave() {
		saving = true;
		try {
			const title = cvData.personalInfo.fullName
				? `CV - ${cvData.personalInfo.fullName}`
				: 'CV Tanpa Judul';

			const res = await fetch(`/api/cv/${data.document.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					template: selectedTemplate,
					data: cvData
				})
			});

			if (res.ok) {
				lastSaved = new Date().toLocaleTimeString('id-ID');
			}
		} catch (e) {
			console.error('Auto-save failed:', e);
		} finally {
			saving = false;
		}
	}
</script>

<div class="navbar bg-base-100 shadow-lg">
	<div class="flex-1">
		<a href="/dashboard" class="btn btn-ghost text-xl">← CV Generator</a>
	</div>
	<div class="flex-none pr-4">
		{#if saving}
			<span class="text-sm text-base-content/50 flex items-center gap-2">
				<span class="loading loading-spinner loading-xs"></span>
				Menyimpan...
			</span>
		{:else if lastSaved}
			<span class="text-sm text-success flex items-center gap-2">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
				Tersimpan {lastSaved}
			</span>
		{/if}
	</div>
</div>

<div class="container mx-auto p-6 max-w-4xl">
	<!-- Steps indicator -->
	<ul class="steps steps-horizontal w-full mb-8">
		<li class="step" class:step-primary={step >= 1}>Isi Data</li>
		<li class="step" class:step-primary={step >= 2}>Pilih Template</li>
		<li class="step" class:step-primary={step >= 3}>Generate PDF</li>
	</ul>

	{#if step === 1}
		<CVForm data={cvData} onUpdate={onFormUpdate} />
		<div class="flex justify-end mt-6">
			<button class="btn btn-primary" onclick={nextStep}>Lanjut → Pilih Template</button>
		</div>
	{:else if step === 2}
		<TemplateSelector selected={selectedTemplate} onSelect={onTemplateSelect} />
		<div class="flex justify-between mt-6">
			<button class="btn btn-ghost" onclick={prevStep}>← Kembali</button>
			<button class="btn btn-primary" onclick={nextStep}>Lanjut → Generate PDF</button>
		</div>
	{:else if step === 3}
		<PDFGenerator data={cvData} template={selectedTemplate} />
		<div class="flex justify-start mt-6">
			<button class="btn btn-ghost" onclick={prevStep}>← Kembali</button>
		</div>
	{/if}
</div>
