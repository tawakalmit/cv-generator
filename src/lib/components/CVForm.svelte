<script lang="ts">
	import type { CVData, Education, Experience, Language, Certification } from '$lib/types';

	interface Props {
		data: CVData;
		onUpdate: (data: CVData) => void;
	}

	let { data, onUpdate }: Props = $props();

	let newSkill = $state('');

	function addEducation() {
		data.education = [...data.education, {
			id: crypto.randomUUID(),
			institution: '',
			degree: '',
			field: '',
			startDate: '',
			endDate: '',
			gpa: ''
		}];
		onUpdate(data);
	}

	function removeEducation(id: string) {
		data.education = data.education.filter(e => e.id !== id);
		onUpdate(data);
	}

	function addExperience() {
		data.experience = [...data.experience, {
			id: crypto.randomUUID(),
			company: '',
			position: '',
			startDate: '',
			endDate: '',
			current: false,
			description: ''
		}];
		onUpdate(data);
	}

	function removeExperience(id: string) {
		data.experience = data.experience.filter(e => e.id !== id);
		onUpdate(data);
	}

	function addSkill() {
		if (newSkill.trim()) {
			data.skills = [...data.skills, newSkill.trim()];
			newSkill = '';
			onUpdate(data);
		}
	}

	function removeSkill(index: number) {
		data.skills = data.skills.filter((_, i) => i !== index);
		onUpdate(data);
	}

	function addLanguage() {
		data.languages = [...data.languages, {
			id: crypto.randomUUID(),
			name: '',
			proficiency: 'Intermediate'
		}];
		onUpdate(data);
	}

	function removeLanguage(id: string) {
		data.languages = data.languages.filter(l => l.id !== id);
		onUpdate(data);
	}

	function addCertification() {
		data.certifications = [...data.certifications, {
			id: crypto.randomUUID(),
			name: '',
			issuer: '',
			date: ''
		}];
		onUpdate(data);
	}

	function removeCertification(id: string) {
		data.certifications = data.certifications.filter(c => c.id !== id);
		onUpdate(data);
	}

	function handleInput() {
		onUpdate(data);
	}

	function handlePhotoUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) return;
		if (file.size > 5 * 1024 * 1024) {
			alert('Ukuran foto maksimal 5MB');
			return;
		}

		uploading = true;
		compressAndConvert(file);
	}

	let uploading = $state(false);

	function compressAndConvert(file: File) {
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => {
				// Resize to max 300x300 for CV photo
				const maxSize = 300;
				let width = img.width;
				let height = img.height;

				if (width > height) {
					if (width > maxSize) {
						height = (height * maxSize) / width;
						width = maxSize;
					}
				} else {
					if (height > maxSize) {
						width = (width * maxSize) / height;
						height = maxSize;
					}
				}

				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.drawImage(img, 0, 0, width, height);
					data.personalInfo.photo = canvas.toDataURL('image/jpeg', 0.8);
					onUpdate(data);
				}
				uploading = false;
			};
			img.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	function removePhoto() {
		data.personalInfo.photo = '';
		onUpdate(data);
	}
</script>

<div class="space-y-6">
	<!-- Personal Info -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-2xl mb-4">Informasi Pribadi</h2>

			<!-- Photo Upload -->
			<div class="flex items-center gap-6 mb-4">
				<div class="relative">
					{#if data.personalInfo.photo}
						<div class="avatar">
							<div class="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
								<img src={data.personalInfo.photo} alt="Foto profil" />
							</div>
						</div>
						<button
							class="btn btn-circle btn-xs btn-error absolute -top-1 -right-1"
							onclick={removePhoto}
						>✕</button>
					{:else if uploading}
						<div class="avatar placeholder">
							<div class="bg-base-300 rounded-full w-24 h-24 flex items-center justify-center">
								<span class="loading loading-spinner loading-md"></span>
							</div>
						</div>
					{:else}
						<div class="avatar placeholder">
							<div class="bg-base-300 text-base-content/50 rounded-full w-24 h-24 flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							</div>
						</div>
					{/if}
				</div>
				<div>
					<label class="btn btn-sm btn-outline {uploading ? 'btn-disabled' : ''}" for="photo-upload">
						{#if uploading}
							Mengupload...
						{:else}
							{data.personalInfo.photo ? 'Ganti Foto' : 'Upload Foto'}
						{/if}
					</label>
					<input
						id="photo-upload"
						type="file"
						accept="image/*"
						class="hidden"
						onchange={handlePhotoUpload}
						disabled={uploading}
					/>
					<p class="text-xs text-base-content/50 mt-1">JPG, PNG. Maks 5MB.</p>
				</div>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
				<fieldset class="fieldset">
					<legend class="fieldset-legend text-sm font-medium">Nama Lengkap *</legend>
					<input type="text" class="input input-bordered w-full" bind:value={data.personalInfo.fullName} oninput={handleInput} placeholder="John Doe" />
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend text-sm font-medium">Email *</legend>
					<input type="email" class="input input-bordered w-full" bind:value={data.personalInfo.email} oninput={handleInput} placeholder="john@example.com" />
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend text-sm font-medium">Telepon *</legend>
					<input type="tel" class="input input-bordered w-full" bind:value={data.personalInfo.phone} oninput={handleInput} placeholder="+62 812 3456 7890" />
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend text-sm font-medium">Alamat</legend>
					<input type="text" class="input input-bordered w-full" bind:value={data.personalInfo.address} oninput={handleInput} placeholder="Jakarta, Indonesia" />
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend text-sm font-medium">LinkedIn</legend>
					<input type="url" class="input input-bordered w-full" bind:value={data.personalInfo.linkedin} oninput={handleInput} placeholder="https://linkedin.com/in/johndoe" />
				</fieldset>
				<fieldset class="fieldset">
					<legend class="fieldset-legend text-sm font-medium">Website</legend>
					<input type="url" class="input input-bordered w-full" bind:value={data.personalInfo.website} oninput={handleInput} placeholder="https://johndoe.com" />
				</fieldset>
				<fieldset class="fieldset md:col-span-2">
					<legend class="fieldset-legend text-sm font-medium">Ringkasan Profil</legend>
					<textarea class="textarea textarea-bordered w-full h-24" bind:value={data.personalInfo.summary} oninput={handleInput} placeholder="Tuliskan ringkasan singkat tentang diri Anda..."></textarea>
				</fieldset>
			</div>
		</div>
	</div>

	<!-- Education -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="flex justify-between items-center mb-2">
				<h2 class="card-title text-2xl">Pendidikan</h2>
				<button class="btn btn-sm btn-primary" onclick={addEducation}>+ Tambah</button>
			</div>
			{#each data.education as edu (edu.id)}
				<div class="border border-base-300 rounded-lg p-5 mt-4 relative">
					<button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2" onclick={() => removeEducation(edu.id)}>✕</button>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pr-8">
						<fieldset class="fieldset">
							<legend class="fieldset-legend text-sm font-medium">Institusi</legend>
							<input type="text" class="input input-bordered w-full" bind:value={edu.institution} oninput={handleInput} placeholder="Universitas Indonesia" />
						</fieldset>
						<fieldset class="fieldset">
							<legend class="fieldset-legend text-sm font-medium">Jenjang</legend>
							<input type="text" class="input input-bordered w-full" bind:value={edu.degree} oninput={handleInput} placeholder="S1" />
						</fieldset>
						<fieldset class="fieldset">
							<legend class="fieldset-legend text-sm font-medium">Jurusan</legend>
							<input type="text" class="input input-bordered w-full" bind:value={edu.field} oninput={handleInput} placeholder="Teknik Informatika" />
						</fieldset>
						<fieldset class="fieldset">
							<legend class="fieldset-legend text-sm font-medium">IPK</legend>
							<input type="text" class="input input-bordered w-full" bind:value={edu.gpa} oninput={handleInput} placeholder="3.80" />
						</fieldset>
						<fieldset class="fieldset">
							<legend class="fieldset-legend text-sm font-medium">Mulai</legend>
							<input type="month" class="input input-bordered w-full" bind:value={edu.startDate} oninput={handleInput} />
						</fieldset>
						<fieldset class="fieldset">
							<legend class="fieldset-legend text-sm font-medium">Selesai</legend>
							<input type="month" class="input input-bordered w-full" bind:value={edu.endDate} oninput={handleInput} />
						</fieldset>
					</div>
				</div>
			{/each}
			{#if data.education.length === 0}
				<p class="text-base-content/50 text-sm mt-2">Belum ada data pendidikan. Klik "+ Tambah" untuk menambahkan.</p>
			{/if}
		</div>
	</div>

	<!-- Experience -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="flex justify-between items-center mb-2">
				<h2 class="card-title text-2xl">Pengalaman Kerja</h2>
				<button class="btn btn-sm btn-primary" onclick={addExperience}>+ Tambah</button>
			</div>
			{#each data.experience as exp (exp.id)}
				<div class="border border-base-300 rounded-lg p-5 mt-4 relative">
					<button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2" onclick={() => removeExperience(exp.id)}>✕</button>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pr-8">
						<fieldset class="fieldset">
							<legend class="fieldset-legend text-sm font-medium">Perusahaan</legend>
							<input type="text" class="input input-bordered w-full" bind:value={exp.company} oninput={handleInput} placeholder="PT Teknologi Nusantara" />
						</fieldset>
						<fieldset class="fieldset">
							<legend class="fieldset-legend text-sm font-medium">Posisi</legend>
							<input type="text" class="input input-bordered w-full" bind:value={exp.position} oninput={handleInput} placeholder="Software Engineer" />
						</fieldset>
						<fieldset class="fieldset">
							<legend class="fieldset-legend text-sm font-medium">Mulai</legend>
							<input type="month" class="input input-bordered w-full" bind:value={exp.startDate} oninput={handleInput} />
						</fieldset>
						<fieldset class="fieldset">
							<legend class="fieldset-legend text-sm font-medium">Selesai</legend>
							<input type="month" class="input input-bordered w-full" bind:value={exp.endDate} oninput={handleInput} disabled={exp.current} />
						</fieldset>
						<div class="md:col-span-2 flex items-center gap-2 py-1">
							<input type="checkbox" class="checkbox checkbox-primary checkbox-sm" bind:checked={exp.current} oninput={handleInput} />
							<span class="text-sm">Masih bekerja di sini</span>
						</div>
						<fieldset class="fieldset md:col-span-2">
							<legend class="fieldset-legend text-sm font-medium">Deskripsi Pekerjaan</legend>
							<textarea class="textarea textarea-bordered w-full h-20" bind:value={exp.description} oninput={handleInput} placeholder="Jelaskan tanggung jawab dan pencapaian Anda..."></textarea>
						</fieldset>
					</div>
				</div>
			{/each}
			{#if data.experience.length === 0}
				<p class="text-base-content/50 text-sm mt-2">Belum ada pengalaman kerja. Klik "+ Tambah" untuk menambahkan.</p>
			{/if}
		</div>
	</div>

	<!-- Skills -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-2xl mb-4">Keahlian</h2>
			<div class="flex gap-2">
				<input type="text" class="input input-bordered flex-1" bind:value={newSkill} placeholder="Ketik keahlian lalu tekan Enter..." onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
				<button class="btn btn-primary" onclick={addSkill}>Tambah</button>
			</div>
			{#if data.skills.length > 0}
				<div class="flex flex-wrap gap-2 mt-4">
					{#each data.skills as skill, index}
						<div class="badge badge-lg badge-primary gap-2 py-3">
							{skill}
							<button class="cursor-pointer hover:opacity-70" onclick={() => removeSkill(index)}>✕</button>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-base-content/50 text-sm mt-2">Belum ada keahlian. Ketik dan tekan Enter untuk menambahkan.</p>
			{/if}
		</div>
	</div>

	<!-- Languages -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="flex justify-between items-center mb-2">
				<h2 class="card-title text-2xl">Bahasa</h2>
				<button class="btn btn-sm btn-primary" onclick={addLanguage}>+ Tambah</button>
			</div>
			{#each data.languages as lang (lang.id)}
				<div class="grid grid-cols-[1fr_1fr_auto] gap-4 items-end mt-4">
					<fieldset class="fieldset">
						<legend class="fieldset-legend text-sm font-medium">Bahasa</legend>
						<input type="text" class="input input-bordered w-full" bind:value={lang.name} oninput={handleInput} placeholder="Indonesia" />
					</fieldset>
					<fieldset class="fieldset">
						<legend class="fieldset-legend text-sm font-medium">Kemahiran</legend>
						<select class="select select-bordered w-full" bind:value={lang.proficiency} onchange={handleInput}>
							<option value="Native">Native</option>
							<option value="Fluent">Fluent</option>
							<option value="Advanced">Advanced</option>
							<option value="Intermediate">Intermediate</option>
							<option value="Basic">Basic</option>
						</select>
					</fieldset>
					<button class="btn btn-sm btn-circle btn-ghost mb-1" onclick={() => removeLanguage(lang.id)}>✕</button>
				</div>
			{/each}
			{#if data.languages.length === 0}
				<p class="text-base-content/50 text-sm mt-2">Belum ada bahasa. Klik "+ Tambah" untuk menambahkan.</p>
			{/if}
		</div>
	</div>

	<!-- Certifications -->
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			<div class="flex justify-between items-center mb-2">
				<h2 class="card-title text-2xl">Sertifikasi</h2>
				<button class="btn btn-sm btn-primary" onclick={addCertification}>+ Tambah</button>
			</div>
			{#each data.certifications as cert (cert.id)}
				<div class="border border-base-300 rounded-lg p-5 mt-4 relative">
					<button class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2" onclick={() => removeCertification(cert.id)}>✕</button>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 pr-8">
						<fieldset class="fieldset">
							<legend class="fieldset-legend text-sm font-medium">Nama Sertifikasi</legend>
							<input type="text" class="input input-bordered w-full" bind:value={cert.name} oninput={handleInput} placeholder="AWS Certified" />
						</fieldset>
						<fieldset class="fieldset">
							<legend class="fieldset-legend text-sm font-medium">Penerbit</legend>
							<input type="text" class="input input-bordered w-full" bind:value={cert.issuer} oninput={handleInput} placeholder="Amazon Web Services" />
						</fieldset>
						<fieldset class="fieldset">
							<legend class="fieldset-legend text-sm font-medium">Tanggal</legend>
							<input type="month" class="input input-bordered w-full" bind:value={cert.date} oninput={handleInput} />
						</fieldset>
					</div>
				</div>
			{/each}
			{#if data.certifications.length === 0}
				<p class="text-base-content/50 text-sm mt-2">Belum ada sertifikasi. Klik "+ Tambah" untuk menambahkan.</p>
			{/if}
		</div>
	</div>
</div>
