import { LLMResponse, JobPosting } from '../../shared/types';

export interface LLMProvider {
  generateCoverLetter(jobPosting: JobPosting, userProfile: UserProfile): Promise<LLMResponse>;
  tailorCV(originalCV: string, jobPosting: JobPosting): Promise<LLMResponse>;
  answerQuestion(question: string, context: any): Promise<LLMResponse>;
  testConnection(): Promise<boolean>;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  achievements: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
}

export abstract class BaseLLMProvider implements LLMProvider {
  protected apiKey: string;
  protected model: string;
  protected maxTokens: number;
  protected temperature: number;

  constructor(apiKey: string, model: string, maxTokens: number = 2000, temperature: number = 0.7) {
    this.apiKey = apiKey;
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  abstract generateCoverLetter(jobPosting: JobPosting, userProfile: UserProfile): Promise<LLMResponse>;
  abstract tailorCV(originalCV: string, jobPosting: JobPosting): Promise<LLMResponse>;
  abstract answerQuestion(question: string, context: any): Promise<LLMResponse>;
  abstract testConnection(): Promise<boolean>;

  protected generateCoverLetterPrompt(jobPosting: JobPosting, userProfile: UserProfile): string {
    return `
Generate a professional cover letter for the following job posting and candidate profile.

Job Details:
- Title: ${jobPosting.title}
- Company: ${jobPosting.company}
- Location: ${jobPosting.location}
- Description: ${jobPosting.description}
- Requirements: ${jobPosting.requirements.join(', ')}

Candidate Profile:
- Name: ${userProfile.name}
- Summary: ${userProfile.summary}
- Skills: ${userProfile.skills.join(', ')}
- Recent Experience: ${userProfile.experience.slice(0, 2).map(exp => 
  `${exp.position} at ${exp.company}: ${exp.description}`
).join('; ')}

Instructions:
1. Write a compelling cover letter that highlights relevant experience and skills
2. Match the tone to the company culture if discernible from the job posting
3. Keep it concise but impactful (3-4 paragraphs)
4. Ensure it's personalized and not generic
5. Include specific examples where possible

Cover Letter:`;
  }

  protected generateCVTailoringPrompt(originalCV: string, jobPosting: JobPosting): string {
    return `
Tailor the following CV to better match this job posting. Focus on highlighting relevant experience, skills, and achievements.

Original CV:
${originalCV}

Job Posting:
- Title: ${jobPosting.title}
- Company: ${jobPosting.company}
- Description: ${jobPosting.description}
- Requirements: ${jobPosting.requirements.join(', ')}

Instructions:
1. Reorder and emphasize experiences most relevant to this role
2. Adjust skill descriptions to match job requirements
3. Quantify achievements where possible
4. Use keywords from the job posting naturally
5. Keep the same format but optimize content
6. Ensure all information remains truthful

Tailored CV:`;
  }

  protected generateQuestionAnswerPrompt(question: string, context: any): string {
    return `
Answer the following application question based on the provided context.

Question: ${question}

Context:
${JSON.stringify(context, null, 2)}

Instructions:
1. Provide a thoughtful, relevant answer
2. Use specific examples when possible
3. Keep the response appropriate for a job application
4. Be honest and authentic
5. Match the expected length for this type of question

Answer:`;
  }
}