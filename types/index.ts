export interface OptimizedResumeResponse {
  profile: {
    summary: string;
    headline: string;
  };
  experiences: {
    role: string;
    company: string;
    duration: string;
    achievements: string[];
  }[];
  skills: {
    technical: string[];
    soft: string[];
  };
  coverLetter: string;
  analysis: {
    strengths: string[];
    weaknesses: string[];
    atsScore: number;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
  price_id?: string;
  cancel_at_period_end: boolean;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  job_title: string;
  job_description: string;
  original_resume_text: string;
  optimized_data: OptimizedResumeResponse;
  created_at: string;
}
