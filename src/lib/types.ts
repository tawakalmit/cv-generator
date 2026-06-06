export interface CVData {
	personalInfo: {
		fullName: string;
		email: string;
		phone: string;
		address: string;
		linkedin: string;
		website: string;
		summary: string;
		photo: string; // base64 data URL
	};
	education: Education[];
	experience: Experience[];
	skills: string[];
	languages: Language[];
	certifications: Certification[];
}

export interface Education {
	id: string;
	institution: string;
	degree: string;
	field: string;
	startDate: string;
	endDate: string;
	gpa: string;
}

export interface Experience {
	id: string;
	company: string;
	position: string;
	startDate: string;
	endDate: string;
	current: boolean;
	description: string;
}

export interface Language {
	id: string;
	name: string;
	proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
}

export interface Certification {
	id: string;
	name: string;
	issuer: string;
	date: string;
}

export interface UserProfile {
	id: string;
	email: string;
	full_name: string;
	avatar_url: string;
	is_verified: boolean;
	created_at: string;
}
