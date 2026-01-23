import { ConfigService, SystemPrompt } from '../lib/ConfigService';
import { getDoc, setDoc, getDocs, doc, collection } from 'firebase/firestore';

// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(() => 'mock-timestamp'),
  Timestamp: {
    now: jest.fn()
  }
}));

// Mock the firebase db instance
jest.mock('../lib/firebase', () => ({
  db: {}
}));

describe('ConfigService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPrompt', () => {
    it('should return prompt content from Firestore if it exists', async () => {
      const mockResult = {
        exists: () => true,
        data: () => ({ content: 'Firestore Prompt Content' })
      };
      (getDoc as jest.Mock).mockResolvedValue(mockResult);

      const content = await ConfigService.getPrompt('technomancer_grimoire');
      expect(content).toBe('Firestore Prompt Content');
      expect(getDoc).toHaveBeenCalled();
    });

    it('should fallback to default prompt if Firestore doc does not exist', async () => {
      const mockResult = {
        exists: () => false
      };
      (getDoc as jest.Mock).mockResolvedValue(mockResult);

      const content = await ConfigService.getPrompt('technomancer_grimoire');
      // Should match one of the default prompts. We check if it's broad enough or specific.
      expect(content.toLowerCase()).toContain('technomancer'); 
    });

    it('should return empty string if prompt ID is unknown and Firestore fails', async () => {
      (getDoc as jest.Mock).mockRejectedValue(new Error('Firestore Error'));
      
      const content = await ConfigService.getPrompt('unknown_id');
      expect(content).toBe('');
    });
  });

  describe('savePrompt', () => {
    it('should call setDoc with correct arguments', async () => {
      const mockPrompt: SystemPrompt = {
        id: 'test_prompt',
        name: 'Test Prompt',
        content: 'Test content',
        category: 'system',
        version: '1.0.0'
      };

      await ConfigService.savePrompt(mockPrompt);
      expect(setDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
        content: 'Test content',
        lastUpdated: 'mock-timestamp'
      }));
    });
  });

  describe('getAllPrompts', () => {
    it('should merge Firestore prompts with defaults', async () => {
      const mockDocs = [
        { id: 'custom_prompt', data: () => ({ id: 'custom_prompt', content: 'Custom Content' }) }
      ];
      const mockSnapshot = {
        forEach: (callback: any) => mockDocs.forEach(callback)
      };
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);

      const allPrompts = await ConfigService.getAllPrompts();
      
      const customPrompt = allPrompts.find(p => p.id === 'custom_prompt');
      const defaultPrompt = allPrompts.find(p => p.id === 'technomancer_grimoire');
      
      expect(customPrompt).toBeDefined();
      expect(defaultPrompt).toBeDefined();
      expect(customPrompt?.content).toBe('Custom Content');
    });
  });
});
