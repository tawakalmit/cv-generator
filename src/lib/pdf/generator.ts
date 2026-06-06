import jsPDF from 'jspdf';
import type { CVData } from '$lib/types';

export async function generatePDF(data: CVData, template: string) {
	const doc = new jsPDF('p', 'mm', 'a4');
	const pageWidth = 210;
	const pageHeight = 297;
	const margin = 15;
	const contentWidth = pageWidth - margin * 2;

	let photoBase64 = '';
	if (data.personalInfo.photo && data.personalInfo.photo.startsWith('data:')) {
		photoBase64 = data.personalInfo.photo;
	}

	switch (template) {
		case 'professional':
			generateProfessional(doc, data, pageWidth, pageHeight, margin, contentWidth, photoBase64);
			break;
		case 'elegant':
			generateElegant(doc, data, pageWidth, pageHeight, margin, contentWidth, photoBase64);
			break;
		case 'vibrant':
			generateVibrant(doc, data, pageWidth, pageHeight, margin, contentWidth, photoBase64);
			break;
		case 'minimal':
			generateMinimal(doc, data, pageWidth, pageHeight, margin, contentWidth);
			break;
		case 'bold':
			generateBold(doc, data, pageWidth, pageHeight, margin, contentWidth, photoBase64);
			break;
		case 'classic-sidebar':
			generateClassicSidebar(doc, data, pageWidth, pageHeight, margin, contentWidth, photoBase64);
			break;
		default:
			generateProfessional(doc, data, pageWidth, pageHeight, margin, contentWidth, photoBase64);
	}

	doc.save(`CV_${data.personalInfo.fullName.replace(/\s+/g, '_')}.pdf`);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function newPageIfNeeded(doc: jsPDF, y: number, pageHeight: number, margin: number, needed: number): number {
	if (y + needed > pageHeight - margin) {
		doc.addPage();
		return margin;
	}
	return y;
}

function drawCircularPhoto(doc: jsPDF, photoBase64: string, centerX: number, centerY: number, radius: number, pageHeight: number) {
	if (!photoBase64) return;
	const k = doc.internal.scaleFactor;
	const cx = centerX * k;
	const cy = (pageHeight - centerY) * k;
	const r = radius * k;
	const kappa = 0.5522848;
	const ox = r * kappa;
	const oy = r * kappa;

	doc.internal.write('q');
	doc.internal.write(
		`${(cx - r).toFixed(2)} ${cy.toFixed(2)} m ` +
		`${(cx - r).toFixed(2)} ${(cy + oy).toFixed(2)} ${(cx - ox).toFixed(2)} ${(cy + r).toFixed(2)} ${cx.toFixed(2)} ${(cy + r).toFixed(2)} c ` +
		`${(cx + ox).toFixed(2)} ${(cy + r).toFixed(2)} ${(cx + r).toFixed(2)} ${(cy + oy).toFixed(2)} ${(cx + r).toFixed(2)} ${cy.toFixed(2)} c ` +
		`${(cx + r).toFixed(2)} ${(cy - oy).toFixed(2)} ${(cx + ox).toFixed(2)} ${(cy - r).toFixed(2)} ${cx.toFixed(2)} ${(cy - r).toFixed(2)} c ` +
		`${(cx - ox).toFixed(2)} ${(cy - r).toFixed(2)} ${(cx - r).toFixed(2)} ${(cy - oy).toFixed(2)} ${(cx - r).toFixed(2)} ${cy.toFixed(2)} c ` +
		'W n'
	);
	try {
		doc.addImage(photoBase64, 'JPEG', centerX - radius, centerY - radius, radius * 2, radius * 2);
	} catch (e) { /* skip */ }
	doc.internal.write('Q');
}

function drawSectionTitle(doc: jsPDF, title: string, x: number, y: number, width: number): number {
	doc.setFontSize(11);
	doc.setFont('helvetica', 'bold');
	doc.setTextColor(33, 37, 41);
	doc.text(title.toUpperCase(), x, y);
	y += 1.5;
	doc.setDrawColor(55, 65, 81);
	doc.setLineWidth(0.4);
	doc.line(x, y, x + width, y);
	y += 5;
	return y;
}

// ─── Professional Template ──────────────────────────────────────────────────

function generateProfessional(
	doc: jsPDF,
	data: CVData,
	pageWidth: number,
	pageHeight: number,
	margin: number,
	contentWidth: number,
	photoBase64: string
) {
	const leftCol = margin;
	const rightCol = margin;
	let y = margin;

	// ── Header Area ──────────────────────────────────────────────────────────
	const headerHeight = 36;
	doc.setFillColor(37, 99, 235);
	doc.rect(0, 0, pageWidth, headerHeight, 'F');

	// Photo (circular clipped)
	const photoSize = 24;
	const photoX = margin;
	const photoY = (headerHeight - photoSize) / 2;
	const textStartX = photoBase64 ? margin + photoSize + 8 : margin;

	if (photoBase64) {
		drawCircularPhoto(doc, photoBase64, photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, pageHeight);
	}

	// Name
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(20);
	doc.setFont('helvetica', 'bold');
	doc.text(data.personalInfo.fullName, textStartX, photoY + 10);

	// Contact line 1
	doc.setFontSize(9);
	doc.setFont('helvetica', 'normal');
	const line1Parts = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.address].filter(Boolean);
	if (line1Parts.length > 0) {
		doc.text(line1Parts.join('   •   '), textStartX, photoY + 17);
	}

	// Contact line 2
	const line2Parts = [data.personalInfo.linkedin, data.personalInfo.website].filter(Boolean);
	if (line2Parts.length > 0) {
		doc.text(line2Parts.join('   •   '), textStartX, photoY + 22);
	}

	y = headerHeight + 10;

	// ── Summary ──────────────────────────────────────────────────────────────
	if (data.personalInfo.summary) {
		y = newPageIfNeeded(doc, y, pageHeight, margin, 20);
		y = drawSectionTitle(doc, 'Profil', leftCol, y, contentWidth);

		doc.setFontSize(9.5);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(55, 65, 81);
		const lines = doc.splitTextToSize(data.personalInfo.summary, contentWidth);
		doc.text(lines, leftCol, y);
		y += lines.length * 4.2 + 8;
	}

	// ── Experience ───────────────────────────────────────────────────────────
	if (data.experience.length > 0) {
		y = newPageIfNeeded(doc, y, pageHeight, margin, 20);
		y = drawSectionTitle(doc, 'Pengalaman Kerja', leftCol, y, contentWidth);

		for (const exp of data.experience) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 22);

			// Position + Date on same line
			doc.setFontSize(10);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(33, 37, 41);
			doc.text(exp.position, leftCol, y);

			const dateStr = `${exp.startDate} – ${exp.current ? 'Sekarang' : exp.endDate}`;
			doc.setFontSize(8.5);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(107, 114, 128);
			const dateWidth = doc.getTextWidth(dateStr);
			doc.text(dateStr, leftCol + contentWidth - dateWidth, y);
			y += 4.5;

			// Company
			doc.setFontSize(9.5);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(37, 99, 235);
			doc.text(exp.company, leftCol, y);
			y += 4.5;

			// Description
			if (exp.description) {
				doc.setFontSize(9);
				doc.setFont('helvetica', 'normal');
				doc.setTextColor(75, 85, 99);
				const descLines = doc.splitTextToSize(exp.description, contentWidth - 4);
				for (const line of descLines) {
					y = newPageIfNeeded(doc, y, pageHeight, margin, 5);
					doc.text(line, leftCol + 2, y);
					y += 3.8;
				}
			}

			y += 5;
		}
		y += 2;
	}

	// ── Education ────────────────────────────────────────────────────────────
	if (data.education.length > 0) {
		y = newPageIfNeeded(doc, y, pageHeight, margin, 20);
		y = drawSectionTitle(doc, 'Pendidikan', leftCol, y, contentWidth);

		for (const edu of data.education) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 16);

			// Degree + Field
			doc.setFontSize(10);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(33, 37, 41);
			doc.text(`${edu.degree} – ${edu.field}`, leftCol, y);

			// Date
			const eduDate = `${edu.startDate} – ${edu.endDate}`;
			doc.setFontSize(8.5);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(107, 114, 128);
			const eduDateWidth = doc.getTextWidth(eduDate);
			doc.text(eduDate, leftCol + contentWidth - eduDateWidth, y);
			y += 4.5;

			// Institution + GPA
			doc.setFontSize(9.5);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(75, 85, 99);
			const instText = edu.institution + (edu.gpa ? `   •   IPK: ${edu.gpa}` : '');
			doc.text(instText, leftCol, y);
			y += 7;
		}
		y += 2;
	}

	// ── Skills ───────────────────────────────────────────────────────────────
	if (data.skills.length > 0) {
		y = newPageIfNeeded(doc, y, pageHeight, margin, 16);
		y = drawSectionTitle(doc, 'Keahlian', leftCol, y, contentWidth);

		doc.setFontSize(9);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(55, 65, 81);

		const skillText = data.skills.join('   •   ');
		const skillLines = doc.splitTextToSize(skillText, contentWidth);
		doc.text(skillLines, leftCol, y);
		y += skillLines.length * 4 + 8;
	}

	// ── Languages ────────────────────────────────────────────────────────────
	if (data.languages.length > 0) {
		y = newPageIfNeeded(doc, y, pageHeight, margin, 16);
		y = drawSectionTitle(doc, 'Bahasa', leftCol, y, contentWidth);

		doc.setFontSize(9);
		doc.setTextColor(55, 65, 81);

		for (const lang of data.languages) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 5);
			doc.setFont('helvetica', 'bold');
			doc.text(lang.name, leftCol, y);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(107, 114, 128);
			doc.text(` — ${lang.proficiency}`, leftCol + doc.getTextWidth(lang.name), y);
			doc.setTextColor(55, 65, 81);
			y += 5;
		}
		y += 6;
	}

	// ── Certifications ───────────────────────────────────────────────────────
	if (data.certifications.length > 0) {
		y = newPageIfNeeded(doc, y, pageHeight, margin, 16);
		y = drawSectionTitle(doc, 'Sertifikasi', leftCol, y, contentWidth);

		doc.setFontSize(9);
		doc.setTextColor(55, 65, 81);

		for (const cert of data.certifications) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 10);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(33, 37, 41);
			doc.text(cert.name, leftCol, y);
			y += 4;
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(107, 114, 128);
			const certDetail = [cert.issuer, cert.date].filter(Boolean).join('   •   ');
			doc.text(certDetail, leftCol, y);
			y += 6;
		}
	}
}

// ─── Elegant Template (Sidebar dark + serif) ────────────────────────────────

function generateElegant(
	doc: jsPDF,
	data: CVData,
	pageWidth: number,
	pageHeight: number,
	margin: number,
	contentWidth: number,
	photoBase64: string
) {
	const sideW = 62;
	const sideColor: [number, number, number] = [30, 41, 59]; // slate-800
	const accentColor: [number, number, number] = [148, 163, 184]; // slate-400
	const mainX = sideW + 12;
	const mainW = pageWidth - mainX - margin;

	// Sidebar background
	doc.setFillColor(...sideColor);
	doc.rect(0, 0, sideW, pageHeight, 'F');

	// ── Sidebar content ──
	let sY = 20;

	// Photo
	if (photoBase64) {
		drawCircularPhoto(doc, photoBase64, sideW / 2, sY + 18, 16, pageHeight);
		sY += 42;
	}

	// Name in sidebar
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(13);
	doc.setFont('times', 'bold');
	const nameLines = doc.splitTextToSize(data.personalInfo.fullName, sideW - 14);
	doc.text(nameLines, 7, sY);
	sY += nameLines.length * 6 + 8;

	// Contact
	doc.setFontSize(7.5);
	doc.setFont('times', 'normal');
	doc.setTextColor(...accentColor);
	const contactFields = [
		data.personalInfo.email,
		data.personalInfo.phone,
		data.personalInfo.address,
		data.personalInfo.linkedin,
		data.personalInfo.website
	].filter(Boolean);
	for (const field of contactFields) {
		const fLines = doc.splitTextToSize(field, sideW - 14);
		doc.text(fLines, 7, sY);
		sY += fLines.length * 3.5 + 2;
	}
	sY += 6;

	// Skills in sidebar
	if (data.skills.length > 0) {
		doc.setFontSize(9);
		doc.setFont('times', 'bold');
		doc.setTextColor(255, 255, 255);
		doc.text('KEAHLIAN', 7, sY);
		sY += 5;
		doc.setDrawColor(...accentColor);
		doc.setLineWidth(0.3);
		doc.line(7, sY, sideW - 7, sY);
		sY += 5;
		doc.setFontSize(7.5);
		doc.setFont('times', 'normal');
		doc.setTextColor(...accentColor);
		for (const skill of data.skills) {
			if (sY > pageHeight - 15) break;
			doc.text(`•  ${skill}`, 7, sY);
			sY += 4;
		}
		sY += 6;
	}

	// Languages in sidebar
	if (data.languages.length > 0) {
		doc.setFontSize(9);
		doc.setFont('times', 'bold');
		doc.setTextColor(255, 255, 255);
		doc.text('BAHASA', 7, sY);
		sY += 5;
		doc.setDrawColor(...accentColor);
		doc.line(7, sY, sideW - 7, sY);
		sY += 5;
		doc.setFontSize(7.5);
		doc.setFont('times', 'normal');
		doc.setTextColor(...accentColor);
		for (const lang of data.languages) {
			if (sY > pageHeight - 15) break;
			doc.text(`${lang.name} — ${lang.proficiency}`, 7, sY);
			sY += 4;
		}
		sY += 6;
	}

	// Certifications in sidebar
	if (data.certifications.length > 0) {
		doc.setFontSize(9);
		doc.setFont('times', 'bold');
		doc.setTextColor(255, 255, 255);
		doc.text('SERTIFIKASI', 7, sY);
		sY += 5;
		doc.setDrawColor(...accentColor);
		doc.line(7, sY, sideW - 7, sY);
		sY += 5;
		doc.setFontSize(7.5);
		doc.setFont('times', 'normal');
		doc.setTextColor(...accentColor);
		for (const cert of data.certifications) {
			if (sY > pageHeight - 15) break;
			const certLines = doc.splitTextToSize(cert.name, sideW - 14);
			doc.text(certLines, 7, sY);
			sY += certLines.length * 3.5 + 1;
			if (cert.issuer) {
				doc.text(cert.issuer, 7, sY);
				sY += 4;
			}
		}
	}

	// ── Main content ──
	let y = 20;

	// Summary
	if (data.personalInfo.summary) {
		doc.setFontSize(10);
		doc.setFont('times', 'bold');
		doc.setTextColor(30, 41, 59);
		doc.text('PROFIL', mainX, y);
		y += 2;
		doc.setDrawColor(30, 41, 59);
		doc.setLineWidth(0.4);
		doc.line(mainX, y, mainX + mainW, y);
		y += 6;
		doc.setFontSize(9);
		doc.setFont('times', 'italic');
		doc.setTextColor(71, 85, 105);
		const sumLines = doc.splitTextToSize(data.personalInfo.summary, mainW);
		doc.text(sumLines, mainX, y);
		y += sumLines.length * 4 + 8;
	}

	// Experience
	if (data.experience.length > 0) {
		y = newPageIfNeeded(doc, y, pageHeight, margin, 16);
		doc.setFontSize(10);
		doc.setFont('times', 'bold');
		doc.setTextColor(30, 41, 59);
		doc.text('PENGALAMAN KERJA', mainX, y);
		y += 2;
		doc.setDrawColor(30, 41, 59);
		doc.line(mainX, y, mainX + mainW, y);
		y += 6;

		for (const exp of data.experience) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 18);
			doc.setFontSize(9.5);
			doc.setFont('times', 'bold');
			doc.setTextColor(30, 41, 59);
			doc.text(exp.position, mainX, y);
			const dateStr = `${exp.startDate} – ${exp.current ? 'Sekarang' : exp.endDate}`;
			doc.setFont('times', 'italic');
			doc.setFontSize(8);
			doc.setTextColor(100, 116, 139);
			doc.text(dateStr, mainX + mainW - doc.getTextWidth(dateStr), y);
			y += 4;
			doc.setFont('times', 'normal');
			doc.setTextColor(71, 85, 105);
			doc.setFontSize(9);
			doc.text(exp.company, mainX, y);
			y += 4.5;
			if (exp.description) {
				doc.setFontSize(8.5);
				const dLines = doc.splitTextToSize(exp.description, mainW - 2);
				doc.text(dLines, mainX + 2, y);
				y += dLines.length * 3.6;
			}
			y += 5;
		}
		y += 2;
	}

	// Education
	if (data.education.length > 0) {
		y = newPageIfNeeded(doc, y, pageHeight, margin, 16);
		doc.setFontSize(10);
		doc.setFont('times', 'bold');
		doc.setTextColor(30, 41, 59);
		doc.text('PENDIDIKAN', mainX, y);
		y += 2;
		doc.setDrawColor(30, 41, 59);
		doc.line(mainX, y, mainX + mainW, y);
		y += 6;

		for (const edu of data.education) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 14);
			doc.setFontSize(9.5);
			doc.setFont('times', 'bold');
			doc.setTextColor(30, 41, 59);
			doc.text(`${edu.degree} – ${edu.field}`, mainX, y);
			const eduDate = `${edu.startDate} – ${edu.endDate}`;
			doc.setFont('times', 'italic');
			doc.setFontSize(8);
			doc.setTextColor(100, 116, 139);
			doc.text(eduDate, mainX + mainW - doc.getTextWidth(eduDate), y);
			y += 4;
			doc.setFont('times', 'normal');
			doc.setFontSize(9);
			doc.setTextColor(71, 85, 105);
			doc.text(edu.institution + (edu.gpa ? `  •  IPK: ${edu.gpa}` : ''), mainX, y);
			y += 7;
		}
	}
}

// ─── Vibrant Template (Green accent, energetic) ─────────────────────────────

function generateVibrant(
	doc: jsPDF,
	data: CVData,
	pageWidth: number,
	pageHeight: number,
	margin: number,
	contentWidth: number,
	photoBase64: string
) {
	const accent: [number, number, number] = [5, 150, 105]; // emerald-600
	const accentLight: [number, number, number] = [209, 250, 229]; // emerald-100
	let y = margin;

	// ── Header ──
	doc.setFillColor(...accent);
	doc.rect(0, 0, pageWidth, 8, 'F');

	y = 18;

	// Photo + Name area
	const hasPhoto = !!photoBase64;
	if (hasPhoto) {
		drawCircularPhoto(doc, photoBase64, margin + 14, y + 14, 14, pageHeight);
	}

	const nameX = hasPhoto ? margin + 36 : margin;
	doc.setFontSize(22);
	doc.setFont('helvetica', 'bold');
	doc.setTextColor(5, 150, 105);
	doc.text(data.personalInfo.fullName, nameX, y + 10);

	doc.setFontSize(9);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(75, 85, 99);
	const contactLine = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.address].filter(Boolean).join('   •   ');
	doc.text(contactLine, nameX, y + 17);
	const linksLine = [data.personalInfo.linkedin, data.personalInfo.website].filter(Boolean).join('   •   ');
	if (linksLine) {
		doc.text(linksLine, nameX, y + 22);
	}

	y = 50;

	// Separator
	doc.setDrawColor(...accent);
	doc.setLineWidth(0.6);
	doc.line(margin, y, pageWidth - margin, y);
	y += 8;

	// Helper for vibrant section title
	function sectionTitle(title: string) {
		y = newPageIfNeeded(doc, y, pageHeight, margin, 14);
		doc.setFillColor(...accentLight);
		doc.roundedRect(margin, y - 3.5, contentWidth, 7, 1.5, 1.5, 'F');
		doc.setFontSize(9.5);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(...accent);
		doc.text(title.toUpperCase(), margin + 4, y + 1);
		y += 9;
	}

	// Summary
	if (data.personalInfo.summary) {
		sectionTitle('Profil');
		doc.setFontSize(9);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(55, 65, 81);
		const lines = doc.splitTextToSize(data.personalInfo.summary, contentWidth);
		doc.text(lines, margin, y);
		y += lines.length * 4 + 7;
	}

	// Experience
	if (data.experience.length > 0) {
		sectionTitle('Pengalaman Kerja');
		for (const exp of data.experience) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 18);
			doc.setFontSize(10);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(33, 37, 41);
			doc.text(exp.position, margin, y);
			const dateStr = `${exp.startDate} – ${exp.current ? 'Sekarang' : exp.endDate}`;
			doc.setFontSize(8);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(107, 114, 128);
			doc.text(dateStr, margin + contentWidth - doc.getTextWidth(dateStr), y);
			y += 4.5;
			doc.setFontSize(9);
			doc.setTextColor(...accent);
			doc.text(exp.company, margin, y);
			y += 4.5;
			if (exp.description) {
				doc.setFontSize(8.5);
				doc.setTextColor(75, 85, 99);
				const dLines = doc.splitTextToSize(exp.description, contentWidth - 2);
				doc.text(dLines, margin + 2, y);
				y += dLines.length * 3.6;
			}
			y += 5;
		}
		y += 2;
	}

	// Education
	if (data.education.length > 0) {
		sectionTitle('Pendidikan');
		for (const edu of data.education) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 14);
			doc.setFontSize(10);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(33, 37, 41);
			doc.text(`${edu.degree} – ${edu.field}`, margin, y);
			const eduDate = `${edu.startDate} – ${edu.endDate}`;
			doc.setFontSize(8);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(107, 114, 128);
			doc.text(eduDate, margin + contentWidth - doc.getTextWidth(eduDate), y);
			y += 4.5;
			doc.setFontSize(9);
			doc.setTextColor(75, 85, 99);
			doc.text(edu.institution + (edu.gpa ? `   •   IPK: ${edu.gpa}` : ''), margin, y);
			y += 7;
		}
		y += 2;
	}

	// Skills
	if (data.skills.length > 0) {
		sectionTitle('Keahlian');
		doc.setFontSize(8.5);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(55, 65, 81);
		const skillStr = data.skills.join('   •   ');
		const sLines = doc.splitTextToSize(skillStr, contentWidth);
		doc.text(sLines, margin, y);
		y += sLines.length * 3.8 + 7;
	}

	// Languages + Certifications side by side text
	if (data.languages.length > 0) {
		sectionTitle('Bahasa');
		doc.setFontSize(8.5);
		doc.setTextColor(55, 65, 81);
		for (const lang of data.languages) {
			doc.setFont('helvetica', 'bold');
			doc.text(lang.name, margin, y);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(107, 114, 128);
			doc.text(` — ${lang.proficiency}`, margin + doc.getTextWidth(lang.name), y);
			doc.setTextColor(55, 65, 81);
			y += 4.5;
		}
		y += 5;
	}

	if (data.certifications.length > 0) {
		sectionTitle('Sertifikasi');
		doc.setFontSize(8.5);
		doc.setTextColor(55, 65, 81);
		for (const cert of data.certifications) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 9);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(33, 37, 41);
			doc.text(cert.name, margin, y);
			y += 4;
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(107, 114, 128);
			doc.text([cert.issuer, cert.date].filter(Boolean).join('  •  '), margin, y);
			y += 5.5;
		}
	}
}

// ─── Minimal Template (No colors, pure content) ─────────────────────────────

function generateMinimal(
	doc: jsPDF,
	data: CVData,
	pageWidth: number,
	pageHeight: number,
	margin: number,
	contentWidth: number
) {
	const lm = 20; // left margin
	let y = 22;

	// Name
	doc.setFontSize(18);
	doc.setFont('helvetica', 'bold');
	doc.setTextColor(0, 0, 0);
	doc.text(data.personalInfo.fullName, lm, y);
	y += 6;

	// Contact in one/two lines
	doc.setFontSize(9);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(80, 80, 80);
	const c1 = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.address].filter(Boolean).join('  |  ');
	doc.text(c1, lm, y);
	y += 4.5;
	const c2 = [data.personalInfo.linkedin, data.personalInfo.website].filter(Boolean).join('  |  ');
	if (c2) {
		doc.text(c2, lm, y);
		y += 4.5;
	}

	// Simple line
	y += 3;
	doc.setDrawColor(200, 200, 200);
	doc.setLineWidth(0.3);
	doc.line(lm, y, pageWidth - lm, y);
	y += 8;

	const cw = pageWidth - lm * 2;

	// Summary
	if (data.personalInfo.summary) {
		doc.setFontSize(9);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(60, 60, 60);
		const sLines = doc.splitTextToSize(data.personalInfo.summary, cw);
		doc.text(sLines, lm, y);
		y += sLines.length * 4 + 8;
	}

	function minSection(title: string) {
		y = newPageIfNeeded(doc, y, pageHeight, margin, 12);
		doc.setFontSize(9.5);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(0, 0, 0);
		doc.text(title, lm, y);
		y += 2;
		doc.setDrawColor(200, 200, 200);
		doc.setLineWidth(0.2);
		doc.line(lm, y, lm + cw, y);
		y += 5;
	}

	// Experience
	if (data.experience.length > 0) {
		minSection('Pengalaman Kerja');
		for (const exp of data.experience) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 16);
			doc.setFontSize(9.5);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(0, 0, 0);
			doc.text(exp.position, lm, y);
			const ds = `${exp.startDate} – ${exp.current ? 'Sekarang' : exp.endDate}`;
			doc.setFontSize(8);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(120, 120, 120);
			doc.text(ds, lm + cw - doc.getTextWidth(ds), y);
			y += 4;
			doc.setFontSize(9);
			doc.setTextColor(80, 80, 80);
			doc.text(exp.company, lm, y);
			y += 4.5;
			if (exp.description) {
				doc.setFontSize(8.5);
				doc.setTextColor(60, 60, 60);
				const dL = doc.splitTextToSize(exp.description, cw);
				doc.text(dL, lm, y);
				y += dL.length * 3.5;
			}
			y += 5;
		}
		y += 2;
	}

	// Education
	if (data.education.length > 0) {
		minSection('Pendidikan');
		for (const edu of data.education) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 12);
			doc.setFontSize(9.5);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(0, 0, 0);
			doc.text(`${edu.degree} – ${edu.field}`, lm, y);
			const ed = `${edu.startDate} – ${edu.endDate}`;
			doc.setFontSize(8);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(120, 120, 120);
			doc.text(ed, lm + cw - doc.getTextWidth(ed), y);
			y += 4;
			doc.setFontSize(9);
			doc.setTextColor(80, 80, 80);
			doc.text(edu.institution + (edu.gpa ? `  |  IPK: ${edu.gpa}` : ''), lm, y);
			y += 7;
		}
		y += 2;
	}

	// Skills
	if (data.skills.length > 0) {
		minSection('Keahlian');
		doc.setFontSize(8.5);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(60, 60, 60);
		const sk = data.skills.join(',  ');
		const skL = doc.splitTextToSize(sk, cw);
		doc.text(skL, lm, y);
		y += skL.length * 3.8 + 6;
	}

	// Languages
	if (data.languages.length > 0) {
		minSection('Bahasa');
		doc.setFontSize(8.5);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(60, 60, 60);
		const langStr = data.languages.map(l => `${l.name} (${l.proficiency})`).join(',  ');
		doc.text(langStr, lm, y);
		y += 6;
	}

	// Certifications
	if (data.certifications.length > 0) {
		minSection('Sertifikasi');
		doc.setFontSize(8.5);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(60, 60, 60);
		for (const cert of data.certifications) {
			doc.text(`${cert.name}${cert.issuer ? ' — ' + cert.issuer : ''}${cert.date ? ' (' + cert.date + ')' : ''}`, lm, y);
			y += 4.5;
		}
	}
}

// ─── Bold Template (Purple gradient, strong layout) ─────────────────────────

function generateBold(
	doc: jsPDF,
	data: CVData,
	pageWidth: number,
	pageHeight: number,
	margin: number,
	contentWidth: number,
	photoBase64: string
) {
	const accent: [number, number, number] = [124, 58, 237]; // violet-600
	const dark: [number, number, number] = [30, 27, 75]; // deep purple

	// ── Header gradient (simulated with strips) ──
	const headerH = 42;
	const steps = 10;
	for (let i = 0; i < steps; i++) {
		const t = i / steps;
		const r = Math.round(124 * (1 - t) + 30 * t);
		const g = Math.round(58 * (1 - t) + 27 * t);
		const b = Math.round(237 * (1 - t) + 75 * t);
		doc.setFillColor(r, g, b);
		doc.rect(0, (headerH / steps) * i, pageWidth, headerH / steps + 0.5, 'F');
	}

	// Photo
	const hasPhoto = !!photoBase64;
	const textX = hasPhoto ? margin + 30 : margin;

	if (hasPhoto) {
		drawCircularPhoto(doc, photoBase64, margin + 13, headerH / 2, 12, pageHeight);
	}

	// Name
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(20);
	doc.setFont('helvetica', 'bold');
	doc.text(data.personalInfo.fullName, textX, 17);

	// Contact
	doc.setFontSize(8.5);
	doc.setFont('helvetica', 'normal');
	const cl1 = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.address].filter(Boolean).join('   •   ');
	doc.text(cl1, textX, 25);
	const cl2 = [data.personalInfo.linkedin, data.personalInfo.website].filter(Boolean).join('   •   ');
	if (cl2) doc.text(cl2, textX, 31);

	let y = headerH + 10;

	// Section title helper
	function boldSection(title: string) {
		y = newPageIfNeeded(doc, y, pageHeight, margin, 14);
		doc.setFontSize(10.5);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(...accent);
		doc.text(title.toUpperCase(), margin, y);
		y += 2;
		doc.setDrawColor(...accent);
		doc.setLineWidth(0.8);
		doc.line(margin, y, margin + 30, y);
		doc.setLineWidth(0.2);
		doc.setDrawColor(220, 220, 220);
		doc.line(margin + 30, y, margin + contentWidth, y);
		y += 6;
	}

	// Summary
	if (data.personalInfo.summary) {
		boldSection('Profil');
		doc.setFontSize(9);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(55, 65, 81);
		const sL = doc.splitTextToSize(data.personalInfo.summary, contentWidth);
		doc.text(sL, margin, y);
		y += sL.length * 4 + 7;
	}

	// Experience
	if (data.experience.length > 0) {
		boldSection('Pengalaman Kerja');
		for (const exp of data.experience) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 18);
			doc.setFontSize(10);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(33, 37, 41);
			doc.text(exp.position, margin, y);
			const ds = `${exp.startDate} – ${exp.current ? 'Sekarang' : exp.endDate}`;
			doc.setFontSize(8);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(140, 140, 140);
			doc.text(ds, margin + contentWidth - doc.getTextWidth(ds), y);
			y += 4.5;
			doc.setFontSize(9);
			doc.setTextColor(...accent);
			doc.text(exp.company, margin, y);
			y += 4.5;
			if (exp.description) {
				doc.setFontSize(8.5);
				doc.setTextColor(75, 85, 99);
				const dL = doc.splitTextToSize(exp.description, contentWidth - 2);
				doc.text(dL, margin + 2, y);
				y += dL.length * 3.6;
			}
			y += 5;
		}
		y += 2;
	}

	// Education
	if (data.education.length > 0) {
		boldSection('Pendidikan');
		for (const edu of data.education) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 14);
			doc.setFontSize(10);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(33, 37, 41);
			doc.text(`${edu.degree} – ${edu.field}`, margin, y);
			const ed = `${edu.startDate} – ${edu.endDate}`;
			doc.setFontSize(8);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(140, 140, 140);
			doc.text(ed, margin + contentWidth - doc.getTextWidth(ed), y);
			y += 4.5;
			doc.setFontSize(9);
			doc.setTextColor(75, 85, 99);
			doc.text(edu.institution + (edu.gpa ? `   •   IPK: ${edu.gpa}` : ''), margin, y);
			y += 7;
		}
		y += 2;
	}

	// Skills
	if (data.skills.length > 0) {
		boldSection('Keahlian');
		doc.setFontSize(8.5);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(55, 65, 81);
		const sk = data.skills.join('   •   ');
		const skL = doc.splitTextToSize(sk, contentWidth);
		doc.text(skL, margin, y);
		y += skL.length * 3.8 + 7;
	}

	// Languages
	if (data.languages.length > 0) {
		boldSection('Bahasa');
		doc.setFontSize(8.5);
		doc.setTextColor(55, 65, 81);
		for (const lang of data.languages) {
			doc.setFont('helvetica', 'bold');
			doc.text(lang.name, margin, y);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(140, 140, 140);
			doc.text(` — ${lang.proficiency}`, margin + doc.getTextWidth(lang.name), y);
			doc.setTextColor(55, 65, 81);
			y += 4.5;
		}
		y += 5;
	}

	// Certifications
	if (data.certifications.length > 0) {
		boldSection('Sertifikasi');
		doc.setFontSize(8.5);
		for (const cert of data.certifications) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 9);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(33, 37, 41);
			doc.text(cert.name, margin, y);
			y += 4;
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(140, 140, 140);
			doc.text([cert.issuer, cert.date].filter(Boolean).join('  •  '), margin, y);
			y += 5.5;
		}
	}

	// Bottom accent bar
	doc.setFillColor(...accent);
	doc.rect(0, pageHeight - 3, pageWidth, 3, 'F');
}

// ─── Classic Sidebar Template (Dark navy sidebar + large photo) ──────────────

function formatMonthYear(dateStr: string): string {
	if (!dateStr) return '';
	const months = ['January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'];
	const parts = dateStr.split('-');
	if (parts.length === 2) {
		const monthIdx = parseInt(parts[1], 10) - 1;
		const year = parts[0];
		if (monthIdx >= 0 && monthIdx < 12) {
			return `${months[monthIdx]} ${year}`;
		}
	}
	return dateStr;
}

function generateClassicSidebar(
	doc: jsPDF,
	data: CVData,
	pageWidth: number,
	pageHeight: number,
	margin: number,
	contentWidth: number,
	photoBase64: string
) {
	const sideW = 65;
	const navy: [number, number, number] = [30, 58, 95]; // dark navy
	const navyLight: [number, number, number] = [70, 130, 180]; // steel blue for accents
	const mainX = sideW + 10;
	const mainW = pageWidth - mainX - 12;

	// ── Sidebar background ──
	doc.setFillColor(...navy);
	doc.rect(0, 0, sideW, pageHeight, 'F');

	// ── Photo (large, circular, top of sidebar) ──
	let sY = 18;
	if (photoBase64) {
		const photoRadius = 22;
		const photoCX = sideW / 2;
		const photoCY = sY + photoRadius;

		// White border circle
		doc.setFillColor(255, 255, 255);
		doc.circle(photoCX, photoCY, photoRadius + 1.5, 'F');

		drawCircularPhoto(doc, photoBase64, photoCX, photoCY, photoRadius, pageHeight);
		sY = photoCY + photoRadius + 10;
	} else {
		sY = 22;
	}

	// ── CONTACT section in sidebar ──
	doc.setFontSize(11);
	doc.setFont('helvetica', 'bold');
	doc.setTextColor(...navyLight);
	doc.text('CONTACT', 8, sY);
	sY += 7;

	doc.setFontSize(8.5);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(220, 220, 220);

	if (data.personalInfo.phone) {
		doc.text(data.personalInfo.phone, 8, sY);
		sY += 5;
	}
	if (data.personalInfo.email) {
		const emailLines = doc.splitTextToSize(data.personalInfo.email, sideW - 16);
		doc.text(emailLines, 8, sY);
		sY += emailLines.length * 3.8 + 2;
	}
	if (data.personalInfo.linkedin) {
		const liLines = doc.splitTextToSize(data.personalInfo.linkedin, sideW - 16);
		doc.text(liLines, 8, sY);
		sY += liLines.length * 3.8 + 2;
	}
	if (data.personalInfo.website) {
		const wLines = doc.splitTextToSize(data.personalInfo.website, sideW - 16);
		doc.text(wLines, 8, sY);
		sY += wLines.length * 3.8 + 2;
	}
	if (data.personalInfo.address) {
		doc.text(data.personalInfo.address, 8, sY);
		sY += 5;
	}

	sY += 8;

	// ── EDUCATION section in sidebar ──
	if (data.education.length > 0) {
		doc.setFontSize(10);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(...navyLight);
		doc.text('EDUCATION', 8, sY);
		sY += 7;

		doc.setTextColor(255, 255, 255);
		for (const edu of data.education) {
			if (sY > pageHeight - 20) break;
			doc.setFontSize(9);
			doc.setFont('helvetica', 'bold');
			doc.text(edu.degree + (edu.field ? ` ${edu.field}` : ''), 8, sY);
			sY += 4;
			doc.setFontSize(8);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(200, 200, 200);
			doc.text(edu.institution, 8, sY);
			sY += 4;
			doc.text(`${formatMonthYear(edu.startDate)} – ${formatMonthYear(edu.endDate)}${edu.gpa ? '  |  IPK: ' + edu.gpa : ''}`, 8, sY);
			sY += 7;
			doc.setTextColor(255, 255, 255);
		}
		sY += 4;
	}

	// ── SKILLS section in sidebar ──
	if (data.skills.length > 0) {
		doc.setFontSize(10);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(...navyLight);
		doc.text('SKILLS', 8, sY);
		sY += 7;

		doc.setFontSize(8);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(220, 220, 220);
		for (const skill of data.skills) {
			if (sY > pageHeight - 12) break;
			doc.text(`▸  ${skill}`, 8, sY);
			sY += 4.5;
		}
		sY += 4;
	}

	// ── LANGUAGES section in sidebar ──
	if (data.languages.length > 0) {
		if (sY < pageHeight - 30) {
			doc.setFontSize(10);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(...navyLight);
			doc.text('LANGUAGES', 8, sY);
			sY += 7;

			doc.setFontSize(8);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(220, 220, 220);
			for (const lang of data.languages) {
				if (sY > pageHeight - 12) break;
				doc.text(`${lang.name} — ${lang.proficiency}`, 8, sY);
				sY += 4.5;
			}
		}
	}

	// ══════════════════════════════════════════════════════════════════════════
	// ── Main content area (right side) ──
	// ══════════════════════════════════════════════════════════════════════════

	let y = 18;

	// ── Name ──
	doc.setFontSize(22);
	doc.setFont('helvetica', 'bold');
	doc.setTextColor(...navyLight);
	// First name lighter, last name darker
	const nameParts = data.personalInfo.fullName.split(' ');
	if (nameParts.length > 1) {
		const firstName = nameParts[0];
		const lastName = nameParts.slice(1).join(' ');
		doc.setTextColor(...navyLight);
		doc.text(firstName + ' ', mainX, y);
		const firstW = doc.getTextWidth(firstName + ' ');
		doc.setTextColor(...navy);
		doc.text(lastName.toUpperCase(), mainX + firstW, y);
	} else {
		doc.text(data.personalInfo.fullName, mainX, y);
	}
	y += 10;

	// ── ABOUT ME ──
	if (data.personalInfo.summary) {
		doc.setFontSize(11.5);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(...navy);
		doc.text('ABOUT ME', mainX, y);
		y += 7;

		doc.setFontSize(9.5);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(60, 60, 60);
		const sumLines = doc.splitTextToSize(data.personalInfo.summary, mainW);
		doc.text(sumLines, mainX, y);
		y += sumLines.length * 4.2 + 6;

		// Separator line
		doc.setDrawColor(...navyLight);
		doc.setLineWidth(0.4);
		doc.line(mainX, y, mainX + mainW, y);
		y += 8;
	}

	// ── WORK EXPERIENCE ──
	if (data.experience.length > 0) {
		doc.setFontSize(11.5);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(...navy);
		doc.text('WORK EXPERIENCE', mainX, y);
		y += 8;

		for (const exp of data.experience) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 22);

			// Company name
			doc.setFontSize(11);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(...navy);
			doc.text(exp.company, mainX, y);

			// Date (right-aligned)
			const dateStr = `${formatMonthYear(exp.startDate)} – ${exp.current ? 'Present' : formatMonthYear(exp.endDate)}`;
			doc.setFontSize(9.5);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(...navyLight);
			doc.text(dateStr, mainX + mainW - doc.getTextWidth(dateStr), y);
			y += 5;

			// Position (italic)
			doc.setFontSize(9.5);
			doc.setFont('helvetica', 'italic');
			doc.setTextColor(100, 100, 100);
			doc.text(exp.position, mainX, y);
			y += 5.5;

			// Description
			if (exp.description) {
				doc.setFontSize(9);
				doc.setFont('helvetica', 'normal');
				doc.setTextColor(60, 60, 60);
				const dLines = doc.splitTextToSize(exp.description, mainW - 2);
				doc.text(dLines, mainX, y);
				y += dLines.length * 4;
			}
			y += 7;
		}
	}

	// ── CERTIFICATIONS (in main area, bottom) ──
	if (data.certifications.length > 0) {
		y = newPageIfNeeded(doc, y, pageHeight, margin, 16);

		// Separator
		doc.setDrawColor(...navyLight);
		doc.setLineWidth(0.4);
		doc.line(mainX, y, mainX + mainW, y);
		y += 7;

		doc.setFontSize(11.5);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(...navy);
		doc.text('CERTIFICATIONS', mainX, y);
		y += 7;

		doc.setFontSize(9.5);
		for (const cert of data.certifications) {
			y = newPageIfNeeded(doc, y, pageHeight, margin, 9);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(...navy);
			doc.text(cert.name, mainX, y);
			y += 4;
			doc.setFont('helvetica', 'italic');
			doc.setTextColor(100, 100, 100);
			doc.text([cert.issuer, cert.date].filter(Boolean).join('  •  '), mainX, y);
			y += 5.5;
		}
	}
}
