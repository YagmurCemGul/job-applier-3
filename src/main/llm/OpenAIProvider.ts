import OpenAI from 'openai';
import { BaseLLMProvider, UserProfile } from './BaseLLMProvider';
import { LLMResponse, JobPosting } from '../../shared/types';

export class OpenAIProvider extends BaseLLMProvider {
  private client: OpenAI;

  constructor(apiKey: string, model: string = 'gpt-4', maxTokens: number = 2000, temperature: number = 0.7) {
    super(apiKey, model, maxTokens, temperature);
    this.client = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  async generateCoverLetter(jobPosting: JobPosting, userProfile: UserProfile): Promise<LLMResponse> {
    try {
      const prompt = this.generateCoverLetterPrompt(jobPosting, userProfile);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional career counselor helping candidates write compelling cover letters.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content received');
      }

      return {
        success: true,
        content: content.trim(),
        tokens: response.usage?.total_tokens,
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async tailorCV(originalCV: string, jobPosting: JobPosting): Promise<LLMResponse> {
    try {
      const prompt = this.generateCVTailoringPrompt(originalCV, jobPosting);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume writer helping candidates optimize their CVs for specific job applications.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content received');
      }

      return {
        success: true,
        content: content.trim(),
        tokens: response.usage?.total_tokens,
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async answerQuestion(question: string, context: any): Promise<LLMResponse> {
    try {
      const prompt = this.generateQuestionAnswerPrompt(question, context);
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are helping a job applicant answer application questions thoughtfully and professionally.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: Math.min(this.maxTokens, 1000), // Shorter responses for questions
        temperature: this.temperature,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content received');
      }

      return {
        success: true,
        content: content.trim(),
        tokens: response.usage?.total_tokens,
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: 'Test connection. Please respond with "Connection successful".'
          }
        ],
        max_tokens: 10,
      });

      return response.choices[0]?.message?.content?.includes('Connection successful') || false;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}