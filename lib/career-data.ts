/**
 * Curated career paths dataset for young adults
 * Includes typical salaries, education requirements, and growth potential
 */

import { CareerPath } from './life-design-types';

export const CAREER_PATHS: CareerPath[] = [
  // TRADES
  {
    id: 'electrician',
    title: 'Electrician',
    category: 'trades',
    typicalSalary: { min: 40000, max: 80000, median: 58000 },
    educationRequired: 'High school diploma + Apprenticeship',
    credentialsRequired: ['State electrician license', 'Apprenticeship completion'],
    timeToEntry: '4-5 years (apprenticeship)',
    growthPotential: 'moderate',
    description:
      'Install, maintain, and repair electrical systems in homes and businesses. High demand with excellent job security.',
  },
  {
    id: 'plumber',
    title: 'Plumber',
    category: 'trades',
    typicalSalary: { min: 42000, max: 85000, median: 60000 },
    educationRequired: 'High school diploma + Apprenticeship',
    credentialsRequired: ['Plumbing license', 'Apprenticeship completion'],
    timeToEntry: '4-5 years (apprenticeship)',
    growthPotential: 'moderate',
    description:
      'Install and repair water, drainage, and gas systems. Always in demand with potential for self-employment.',
  },
  {
    id: 'hvac-technician',
    title: 'HVAC Technician',
    category: 'trades',
    typicalSalary: { min: 38000, max: 75000, median: 52000 },
    educationRequired: 'Technical school or Apprenticeship',
    credentialsRequired: ['EPA certification', 'State license'],
    timeToEntry: '6 months - 2 years',
    growthPotential: 'high',
    description:
      'Install and maintain heating, ventilation, and air conditioning systems. Growing demand due to climate concerns.',
  },
  {
    id: 'welder',
    title: 'Welder',
    category: 'trades',
    typicalSalary: { min: 35000, max: 70000, median: 48000 },
    educationRequired: 'Technical school or Certificate',
    credentialsRequired: ['Welding certification (AWS)'],
    timeToEntry: '6 months - 1 year',
    growthPotential: 'moderate',
    description:
      'Join metal parts using specialized equipment. Critical for manufacturing, construction, and infrastructure.',
  },

  // TECH
  {
    id: 'web-developer',
    title: 'Web Developer',
    category: 'tech',
    typicalSalary: { min: 50000, max: 110000, median: 75000 },
    educationRequired: 'Bootcamp or Associate degree (or self-taught)',
    credentialsRequired: ['Portfolio of projects'],
    timeToEntry: '6 months - 2 years',
    growthPotential: 'very-high',
    description:
      'Build and maintain websites and web applications. High demand with remote work opportunities.',
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    category: 'tech',
    typicalSalary: { min: 70000, max: 150000, median: 95000 },
    educationRequired: "Bachelor's degree in CS or Bootcamp",
    credentialsRequired: ['Strong portfolio or GitHub contributions'],
    timeToEntry: '2-4 years',
    growthPotential: 'very-high',
    description:
      'Design and develop software applications. Excellent salary potential and career growth.',
  },
  {
    id: 'it-support',
    title: 'IT Support Specialist',
    category: 'tech',
    typicalSalary: { min: 35000, max: 65000, median: 48000 },
    educationRequired: 'Certificate or Associate degree',
    credentialsRequired: ['CompTIA A+', 'Network+'],
    timeToEntry: '3-6 months',
    growthPotential: 'moderate',
    description:
      'Help users troubleshoot computer problems. Entry-level path into tech with clear advancement.',
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    category: 'tech',
    typicalSalary: { min: 55000, max: 95000, median: 70000 },
    educationRequired: "Bachelor's degree or Bootcamp",
    credentialsRequired: ['SQL', 'Excel', 'Data visualization tools'],
    timeToEntry: '1-2 years',
    growthPotential: 'high',
    description:
      'Analyze data to help businesses make decisions. Growing field with opportunities across industries.',
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    category: 'tech',
    typicalSalary: { min: 65000, max: 120000, median: 85000 },
    educationRequired: "Bachelor's degree or Certificates",
    credentialsRequired: ['Security+', 'CEH or CISSP'],
    timeToEntry: '2-3 years',
    growthPotential: 'very-high',
    description:
      'Protect computer systems from cyber threats. Critical and fast-growing field with excellent pay.',
  },

  // HEALTHCARE
  {
    id: 'registered-nurse',
    title: 'Registered Nurse (RN)',
    category: 'healthcare',
    typicalSalary: { min: 60000, max: 100000, median: 75000 },
    educationRequired: 'Associate or Bachelor of Science in Nursing',
    credentialsRequired: ['NCLEX-RN license', 'State nursing license'],
    timeToEntry: '2-4 years',
    growthPotential: 'high',
    description:
      'Provide patient care in hospitals, clinics, and other settings. High demand with excellent job security.',
  },
  {
    id: 'dental-hygienist',
    title: 'Dental Hygienist',
    category: 'healthcare',
    typicalSalary: { min: 60000, max: 95000, median: 77000 },
    educationRequired: 'Associate degree',
    credentialsRequired: ['State license', 'National board exam'],
    timeToEntry: '2-3 years',
    growthPotential: 'moderate',
    description:
      'Clean teeth and provide preventive dental care. Great work-life balance with flexible schedules.',
  },
  {
    id: 'medical-assistant',
    title: 'Medical Assistant',
    category: 'healthcare',
    typicalSalary: { min: 28000, max: 45000, median: 36000 },
    educationRequired: 'Certificate or Associate degree',
    credentialsRequired: ['CMA or RMA certification (optional but preferred)'],
    timeToEntry: '1 year',
    growthPotential: 'moderate',
    description:
      'Support healthcare providers in clinics and offices. Fast entry into healthcare with room for advancement.',
  },
  {
    id: 'physical-therapist',
    title: 'Physical Therapist',
    category: 'healthcare',
    typicalSalary: { min: 70000, max: 110000, median: 90000 },
    educationRequired: 'Doctoral degree (DPT)',
    credentialsRequired: ['State PT license', 'National exam'],
    timeToEntry: '6-7 years',
    growthPotential: 'high',
    description:
      'Help patients recover from injuries and improve mobility. Rewarding career with excellent salary.',
  },
  {
    id: 'radiologic-technologist',
    title: 'Radiologic Technologist',
    category: 'healthcare',
    typicalSalary: { min: 50000, max: 80000, median: 62000 },
    educationRequired: 'Associate degree',
    credentialsRequired: ['ARRT certification', 'State license'],
    timeToEntry: '2 years',
    growthPotential: 'moderate',
    description:
      'Operate imaging equipment (X-rays, CT scans). Technical healthcare career with good pay.',
  },

  // BUSINESS
  {
    id: 'accountant',
    title: 'Accountant',
    category: 'business',
    typicalSalary: { min: 50000, max: 90000, median: 65000 },
    educationRequired: "Bachelor's degree in Accounting",
    credentialsRequired: ['CPA license (for advancement)'],
    timeToEntry: '4 years',
    growthPotential: 'moderate',
    description:
      'Manage financial records and tax compliance. Stable career with clear advancement path.',
  },
  {
    id: 'project-manager',
    title: 'Project Manager',
    category: 'business',
    typicalSalary: { min: 60000, max: 120000, median: 85000 },
    educationRequired: "Bachelor's degree (any field) + Experience",
    credentialsRequired: ['PMP or Agile certification'],
    timeToEntry: '3-5 years',
    growthPotential: 'high',
    description:
      'Lead teams and coordinate projects across organizations. Versatile role applicable to any industry.',
  },
  {
    id: 'sales-representative',
    title: 'Sales Representative',
    category: 'business',
    typicalSalary: { min: 40000, max: 100000, median: 60000 },
    educationRequired: 'High school diploma (Bachelor preferred)',
    credentialsRequired: ['Sales training or certification'],
    timeToEntry: '0-1 year',
    growthPotential: 'high',
    description:
      'Sell products or services to customers. Income often includes commission with high earning potential.',
  },
  {
    id: 'hr-specialist',
    title: 'Human Resources Specialist',
    category: 'business',
    typicalSalary: { min: 45000, max: 75000, median: 58000 },
    educationRequired: "Bachelor's degree",
    credentialsRequired: ['PHR or SHRM-CP certification'],
    timeToEntry: '2-4 years',
    growthPotential: 'moderate',
    description:
      'Manage employee relations, recruiting, and workplace policies. People-focused business role.',
  },
  {
    id: 'financial-advisor',
    title: 'Financial Advisor',
    category: 'business',
    typicalSalary: { min: 50000, max: 150000, median: 85000 },
    educationRequired: "Bachelor's degree",
    credentialsRequired: ['Series 7 & 63 licenses', 'CFP certification'],
    timeToEntry: '2-4 years',
    growthPotential: 'very-high',
    description:
      'Help clients manage investments and plan finances. High earning potential with client base growth.',
  },

  // EDUCATION
  {
    id: 'teacher',
    title: 'Teacher (K-12)',
    category: 'education',
    typicalSalary: { min: 40000, max: 70000, median: 55000 },
    educationRequired: "Bachelor's degree + Teaching credential",
    credentialsRequired: ['State teaching license', 'Student teaching'],
    timeToEntry: '4-5 years',
    growthPotential: 'low',
    description:
      'Educate students in various subjects. Stable career with benefits, summers off, and strong job security.',
  },
  {
    id: 'corporate-trainer',
    title: 'Corporate Trainer',
    category: 'education',
    typicalSalary: { min: 50000, max: 85000, median: 65000 },
    educationRequired: "Bachelor's degree + Experience",
    credentialsRequired: ['Training certification (ATD)'],
    timeToEntry: '3-5 years',
    growthPotential: 'moderate',
    description:
      'Develop and deliver training programs for businesses. Blend of education and corporate work.',
  },

  // CREATIVE
  {
    id: 'graphic-designer',
    title: 'Graphic Designer',
    category: 'creative',
    typicalSalary: { min: 38000, max: 75000, median: 52000 },
    educationRequired: "Associate or Bachelor's degree (or portfolio)",
    credentialsRequired: ['Strong portfolio'],
    timeToEntry: '2-4 years',
    growthPotential: 'moderate',
    description:
      'Create visual content for brands and marketing. Creative field with freelance opportunities.',
  },
  {
    id: 'ux-designer',
    title: 'UX/UI Designer',
    category: 'creative',
    typicalSalary: { min: 60000, max: 110000, median: 80000 },
    educationRequired: 'Bootcamp, Certificate, or Bachelor degree',
    credentialsRequired: ['Portfolio of design work'],
    timeToEntry: '1-3 years',
    growthPotential: 'very-high',
    description:
      'Design user experiences for websites and apps. High demand in tech with excellent pay.',
  },
  {
    id: 'video-editor',
    title: 'Video Editor',
    category: 'creative',
    typicalSalary: { min: 35000, max: 75000, median: 52000 },
    educationRequired: 'Certificate or Self-taught',
    credentialsRequired: ['Demo reel/portfolio'],
    timeToEntry: '1-2 years',
    growthPotential: 'moderate',
    description:
      'Edit video content for media, marketing, or entertainment. Growing field with remote opportunities.',
  },
  {
    id: 'content-writer',
    title: 'Content Writer',
    category: 'creative',
    typicalSalary: { min: 35000, max: 70000, median: 50000 },
    educationRequired: "Bachelor's degree (English, Marketing, or related)",
    credentialsRequired: ['Writing portfolio'],
    timeToEntry: '1-2 years',
    growthPotential: 'moderate',
    description:
      'Create written content for websites, blogs, and marketing. Flexible career with remote work options.',
  },
];

/**
 * Get career paths filtered by category
 */
export function getCareerPathsByCategory(
  category: CareerPath['category']
): CareerPath[] {
  return CAREER_PATHS.filter((path) => path.category === category);
}

/**
 * Get career paths that match or exceed a target income
 */
export function getCareerPathsByIncome(targetIncome: number): CareerPath[] {
  const targetAnnual = targetIncome * 12;
  return CAREER_PATHS.filter((path) => path.typicalSalary.median >= targetAnnual);
}

/**
 * Get top 3 career recommendations based on income target and time to entry
 */
export function getRecommendedCareers(
  targetMonthlyIncome: number,
  prioritizeSpeed: boolean = false
): CareerPath[] {
  const targetAnnual = targetMonthlyIncome * 12;

  // Filter paths that can meet the income target
  let matching = CAREER_PATHS.filter(
    (path) => path.typicalSalary.median >= targetAnnual * 0.8 // Allow 20% buffer
  );

  if (matching.length === 0) {
    // If no matches, get the highest paying careers
    matching = [...CAREER_PATHS].sort(
      (a, b) => b.typicalSalary.median - a.typicalSalary.median
    );
  }

  // Sort by time to entry if speed is prioritized
  if (prioritizeSpeed) {
    matching.sort((a, b) => {
      const timeA = parseFloat(a.timeToEntry);
      const timeB = parseFloat(b.timeToEntry);
      return timeA - timeB;
    });
  } else {
    // Otherwise sort by growth potential and then income
    const growthScore = {
      'very-high': 4,
      high: 3,
      moderate: 2,
      low: 1,
    };
    matching.sort((a, b) => {
      const scoreA = growthScore[a.growthPotential] * 1000 + a.typicalSalary.median;
      const scoreB = growthScore[b.growthPotential] * 1000 + b.typicalSalary.median;
      return scoreB - scoreA;
    });
  }

  return matching.slice(0, 3);
}
