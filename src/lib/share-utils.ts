interface ShareStudent {
  student_name: string;
  mobile: string;
  email: string;
  dob?: string | null;
}

interface ShareCourse {
  name: string;
  university: { name: string; country: string };
  duration: string;
  tuition_fees: number;
  currency: string;
  match_score?: number | null;
  eligibility_status?: string | null;
}

export function buildShareMessage(student: ShareStudent, courses: ShareCourse[]): string {
  const lines: string[] = [];

  lines.push('*Edroots International — Course Recommendations*');
  lines.push('');
  lines.push(`*Student:* ${student.student_name}`);
  lines.push(`*Mobile:* ${student.mobile}`);
  lines.push(`*Email:* ${student.email}`);
  if (student.dob) {
    lines.push(`*DOB:* ${student.dob}`);
  }
  lines.push('');

  if (courses.length === 0) {
    lines.push('No courses shortlisted yet.');
  } else {
    lines.push('*Recommended Courses:*');
    courses.forEach((c, i) => {
      lines.push('');
      lines.push(`${i + 1}. ${c.university.name} — ${c.name}`);
      const details = [
        c.university.country,
        c.duration,
        `${c.currency} ${c.tuition_fees.toLocaleString()}`,
      ];
      if (c.match_score != null) details.push(`Match: ${c.match_score}%`);
      if (c.eligibility_status) details.push(c.eligibility_status);
      lines.push(`   ${details.join(' | ')}`);
    });
  }

  return lines.join('\n');
}

export function buildPlainMessage(student: ShareStudent, courses: ShareCourse[]): string {
  // Same content but without WhatsApp bold markers
  return buildShareMessage(student, courses).replace(/\*/g, '');
}

export function shareViaWhatsApp(student: ShareStudent, courses: ShareCourse[]) {
  const text = buildShareMessage(student, courses);
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export function shareViaEmail(student: ShareStudent, courses: ShareCourse[]) {
  const body = buildPlainMessage(student, courses);
  const subject = `Edroots International — Course Recommendations for ${student.student_name}`;
  const mailto = `mailto:${encodeURIComponent(student.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto, '_blank');
}
