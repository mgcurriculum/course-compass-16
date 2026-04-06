// Matching Engine — calculates eligibility and match score

export interface StudentInput {
  studyLevel: string;
  tenthMarks?: number;
  twelfthMarks?: number;
  twelfthEnglishMarks?: number;
  graduationDegree?: string;
  graduationMarks?: number;
  ieltsScore?: number;
  workExperience?: number;
  preferredCountries?: string[];
  preferredDomains?: string[];
  preferredDuration?: string;
  preferredCourseType?: string;
  maxTuitionFee?: number;
}

export interface CourseWithDetails {
  id: string;
  name: string;
  study_level: string;
  domain: string;
  degree_type: string | null;
  duration: string;
  tuition_fees: number;
  currency: string;
  course_type: string | null;
  description: string | null;
  university: {
    name: string;
    country: string;
    city: string;
    ranking: number | null;
    partner_status: boolean;
  };
  eligibility: {
    min_10th_marks: number | null;
    min_12th_marks: number | null;
    min_graduation_marks: number | null;
    required_degree: string | null;
    min_ielts: number | null;
    min_work_experience: number | null;
    backlogs_allowed: number | null;
  } | null;
  intakes: {
    intake_name: string;
    month: number;
    year: number;
    application_deadline: string | null;
  }[];
}

export interface MatchResult {
  course: CourseWithDetails;
  matchScore: number;
  eligibilityStatus: 'Eligible' | 'Borderline' | 'Not Eligible';
  eligibilitySummary: string;
}

function checkEligibility(student: StudentInput, elig: CourseWithDetails['eligibility']): {
  status: 'Eligible' | 'Borderline' | 'Not Eligible';
  score: number; // 0-100 for eligibility portion
  summary: string;
} {
  if (!elig) return { status: 'Eligible', score: 100, summary: 'No specific requirements' };

  const issues: string[] = [];
  const borderline: string[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  // 12th marks check (for Bachelor's)
  if (elig.min_12th_marks != null) {
    totalChecks++;
    const marks = student.twelfthMarks ?? 0;
    if (marks >= elig.min_12th_marks) {
      passedChecks++;
    } else if (marks >= elig.min_12th_marks - 5) {
      passedChecks += 0.5;
      borderline.push(`12th marks ${marks}% (need ${elig.min_12th_marks}%)`);
    } else {
      issues.push(`12th marks ${marks}% < ${elig.min_12th_marks}%`);
    }
  }

  // 10th marks check (for Diploma)
  if (elig.min_10th_marks != null) {
    totalChecks++;
    const marks = student.tenthMarks ?? 0;
    if (marks >= elig.min_10th_marks) {
      passedChecks++;
    } else if (marks >= elig.min_10th_marks - 5) {
      passedChecks += 0.5;
      borderline.push(`10th marks ${marks}% (need ${elig.min_10th_marks}%)`);
    } else {
      issues.push(`10th marks ${marks}% < ${elig.min_10th_marks}%`);
    }
  }

  // Graduation marks check (for Master's / PG Diploma)
  if (elig.min_graduation_marks != null) {
    totalChecks++;
    const marks = student.graduationMarks ?? 0;
    if (marks >= elig.min_graduation_marks) {
      passedChecks++;
    } else if (marks >= elig.min_graduation_marks - 5) {
      passedChecks += 0.5;
      borderline.push(`Graduation marks ${marks}% (need ${elig.min_graduation_marks}%)`);
    } else {
      issues.push(`Graduation marks ${marks}% < ${elig.min_graduation_marks}%`);
    }
  }

  // Required degree check
  if (elig.required_degree) {
    totalChecks++;
    const studentDeg = (student.graduationDegree ?? '').toLowerCase();
    const reqDeg = elig.required_degree.toLowerCase();
    if (studentDeg.includes(reqDeg) || reqDeg.includes(studentDeg)) {
      passedChecks++;
    } else if (studentDeg) {
      borderline.push(`Degree: ${student.graduationDegree} (prefers ${elig.required_degree})`);
      passedChecks += 0.5;
    } else {
      issues.push(`Requires ${elig.required_degree} degree`);
    }
  }

  // IELTS check
  if (elig.min_ielts != null) {
    totalChecks++;
    const score = student.ieltsScore ?? 0;
    if (score >= elig.min_ielts) {
      passedChecks++;
    } else if (score >= elig.min_ielts - 0.5) {
      passedChecks += 0.5;
      borderline.push(`IELTS ${score} (need ${elig.min_ielts})`);
    } else {
      issues.push(`IELTS ${score} < ${elig.min_ielts}`);
    }
  }

  // Work experience check
  if (elig.min_work_experience != null && elig.min_work_experience > 0) {
    totalChecks++;
    const exp = student.workExperience ?? 0;
    if (exp >= elig.min_work_experience) {
      passedChecks++;
    } else {
      issues.push(`${elig.min_work_experience} yr experience required (have ${exp})`);
    }
  }

  const eligScore = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 100;

  let status: 'Eligible' | 'Borderline' | 'Not Eligible';
  if (issues.length === 0 && borderline.length === 0) {
    status = 'Eligible';
  } else if (issues.length === 0) {
    status = 'Borderline';
  } else {
    status = eligScore >= 60 ? 'Borderline' : 'Not Eligible';
  }

  const summaryParts = [];
  if (issues.length) summaryParts.push('Issues: ' + issues.join(', '));
  if (borderline.length) summaryParts.push('Close: ' + borderline.join(', '));
  if (!summaryParts.length) summaryParts.push('Meets all requirements');

  return { status, score: eligScore, summary: summaryParts.join('. ') };
}

function calculatePreferenceScore(student: StudentInput, course: CourseWithDetails): number {
  let score = 0;
  let totalWeight = 0;

  // Country match (weight: 25)
  if (student.preferredCountries?.length) {
    totalWeight += 25;
    if (student.preferredCountries.includes(course.university.country)) {
      score += 25;
    }
  }

  // Domain match (weight: 25)
  if (student.preferredDomains?.length) {
    totalWeight += 25;
    if (student.preferredDomains.some(d => course.domain.toLowerCase().includes(d.toLowerCase()))) {
      score += 25;
    }
  }

  // Duration match (weight: 15)
  if (student.preferredDuration) {
    totalWeight += 15;
    if (course.duration.includes(student.preferredDuration)) {
      score += 15;
    }
  }

  // Course type match (weight: 10)
  if (student.preferredCourseType) {
    totalWeight += 10;
    if (course.course_type === student.preferredCourseType) {
      score += 10;
    }
  }

  // Fee range match (weight: 25)
  if (student.maxTuitionFee != null && student.maxTuitionFee > 0) {
    totalWeight += 25;
    if (course.tuition_fees <= student.maxTuitionFee) {
      score += 25;
    } else if (course.tuition_fees <= student.maxTuitionFee * 1.2) {
      score += 12;
    }
  }

  if (totalWeight === 0) return 100;
  return Math.round((score / totalWeight) * 100);
}

export function matchCourses(student: StudentInput, courses: CourseWithDetails[]): MatchResult[] {
  return courses
    .filter(c => c.study_level === student.studyLevel)
    .map(course => {
      const { status, score: eligScore, summary } = checkEligibility(student, course.eligibility);
      const prefScore = calculatePreferenceScore(student, course);

      // Weighted: 60% eligibility, 40% preference
      const matchScore = Math.round(eligScore * 0.6 + prefScore * 0.4);

      return {
        course,
        matchScore,
        eligibilityStatus: status,
        eligibilitySummary: summary,
      };
    })
    .sort((a, b) => {
      // Sort: Eligible first, then Borderline, then Not Eligible. Within each, by score desc
      const statusOrder = { Eligible: 0, Borderline: 1, 'Not Eligible': 2 };
      const statusDiff = statusOrder[a.eligibilityStatus] - statusOrder[b.eligibilityStatus];
      if (statusDiff !== 0) return statusDiff;
      return b.matchScore - a.matchScore;
    });
}
