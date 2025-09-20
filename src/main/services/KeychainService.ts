import * as keytar from 'keytar';
import { KEYCHAIN_SERVICE } from '../../shared/constants';

export class KeychainService {
  private serviceName: string;

  constructor(serviceName: string = KEYCHAIN_SERVICE) {
    this.serviceName = serviceName;
  }

  async setPassword(account: string, password: string): Promise<boolean> {
    try {
      await keytar.setPassword(this.serviceName, account, password);
      return true;
    } catch (error) {
      console.error('Failed to set password in keychain:', error);
      return false;
    }
  }

  async getPassword(account: string): Promise<string | null> {
    try {
      return await keytar.getPassword(this.serviceName, account);
    } catch (error) {
      console.error('Failed to get password from keychain:', error);
      return null;
    }
  }

  async deletePassword(account: string): Promise<boolean> {
    try {
      return await keytar.deletePassword(this.serviceName, account);
    } catch (error) {
      console.error('Failed to delete password from keychain:', error);
      return false;
    }
  }

  async findCredentials(): Promise<Array<{ account: string; password: string }>> {
    try {
      return await keytar.findCredentials(this.serviceName);
    } catch (error) {
      console.error('Failed to find credentials in keychain:', error);
      return [];
    }
  }

  // Convenience methods for common API keys
  async setOpenAIKey(apiKey: string): Promise<boolean> {
    return this.setPassword('openai_api_key', apiKey);
  }

  async getOpenAIKey(): Promise<string | null> {
    return this.getPassword('openai_api_key');
  }

  async setAnthropicKey(apiKey: string): Promise<boolean> {
    return this.setPassword('anthropic_api_key', apiKey);
  }

  async getAnthropicKey(): Promise<string | null> {
    return this.getPassword('anthropic_api_key');
  }

  async setGoogleKey(apiKey: string): Promise<boolean> {
    return this.setPassword('google_api_key', apiKey);
  }

  async getGoogleKey(): Promise<string | null> {
    return this.getPassword('google_api_key');
  }

  async setLinkedInCredentials(email: string, password: string): Promise<boolean> {
    const success1 = await this.setPassword('linkedin_email', email);
    const success2 = await this.setPassword('linkedin_password', password);
    return success1 && success2;
  }

  async getLinkedInCredentials(): Promise<{ email: string | null; password: string | null }> {
    const email = await this.getPassword('linkedin_email');
    const password = await this.getPassword('linkedin_password');
    return { email, password };
  }

  async setIndeedCredentials(email: string, password: string): Promise<boolean> {
    const success1 = await this.setPassword('indeed_email', email);
    const success2 = await this.setPassword('indeed_password', password);
    return success1 && success2;
  }

  async getIndeedCredentials(): Promise<{ email: string | null; password: string | null }> {
    const email = await this.getPassword('indeed_email');
    const password = await this.getPassword('indeed_password');
    return { email, password };
  }
}