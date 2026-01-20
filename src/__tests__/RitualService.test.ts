import { RitualService } from '../lib/RitualService';
import { technomancerModel } from '../lib/gemini';
import { PersistenceService } from '../lib/PersistenceService';

jest.mock('../lib/gemini', () => ({
  technomancerModel: {
    generateContent: jest.fn()
  }
}));

jest.mock('../lib/PersistenceService', () => ({
  PersistenceService: {
    saveMessage: jest.fn()
  }
}));

jest.mock('../lib/ConfigService', () => ({
  ConfigService: {
    getPrompt: jest.fn().mockResolvedValue('Perform a {{paradigm}} ritual for: {{intent}}')
  }
}));

describe('RitualService JSON Parsing', () => {
  const userId = 'test-user';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockResponse = (text: string) => {
    (technomancerModel.generateContent as jest.Mock).mockResolvedValue({
      response: {
        text: () => text
      }
    });
  };

  it('parses clean JSON correctly', async () => {
    const validJson = JSON.stringify({
      sigil: '<svg></svg>',
      vision: { incantation: 'Abra', thought: 'Deep' },
      context: { intent: 'test', paradigm: 'Techno' }
    });
    mockResponse(validJson);

    const result = await RitualService.performRitual(userId, 'test', 'Techno');
    expect(result.sigil).toBe('<svg></svg>');
    expect(PersistenceService.saveMessage).toHaveBeenCalled();
  });

  it('parses JSON within markdown code blocks', async () => {
    const responseWithMarkdown = "Here is your ritual:\n```json\n" + JSON.stringify({
      sigil: '<svg>markdown</svg>',
      vision: { incantation: 'Cadabra', thought: 'Markdown' },
      context: { intent: 'test', paradigm: 'Techno' }
    }) + "\n```\nHope it works!";
    mockResponse(responseWithMarkdown);

    const result = await RitualService.performRitual(userId, 'test', 'Techno');
    expect(result.sigil).toBe('<svg>markdown</svg>');
  });

  it('parses JSON with leading and trailing text (no code blocks)', async () => {
    const noisyResponse = "Sure thing! { \"sigil\": \"<svg>noisy</svg>\", \"vision\": { \"incantation\": \"Noise\", \"thought\": \"Static\" }, \"context\": { \"intent\": \"test\", \"paradigm\": \"Techno\" } } Good luck.";
    mockResponse(noisyResponse);

    const result = await RitualService.performRitual(userId, 'test', 'Techno');
    expect(result.sigil).toBe('<svg>noisy</svg>');
  });

  it('parses JSON with internal braces in noisy text', async () => {
    const complexResponse = "I found { something } but here is the ritual: { \"sigil\": \"<svg>{braces}</svg>\", \"vision\": { \"incantation\": \"Brace\", \"thought\": \"Match\" } } Done.";
    mockResponse(complexResponse);

    const result = await RitualService.performRitual(userId, 'test', 'Techno');
    expect(result.sigil).toBe('<svg>{braces}</svg>');
  });

  it('handles "fizzled" ritual on complete failure', async () => {
    mockResponse("This is not JSON and has no braces.");
    const result = await RitualService.performRitual(userId, 'test', 'Techno');
    expect(result.vision.incantation).toBe("The Void remains silent...");
  });

  it('should return fizzled ritual on completely empty response', async () => {
    mockResponse("");
    const result = await RitualService.performRitual(userId, 'test', 'Techno');
    expect(result.vision.incantation).toBe("The Void remains silent...");
  });

  it('should return fizzled ritual on malformed JSON', async () => {
    mockResponse("{ \"broken\": ");
    const result = await RitualService.performRitual(userId, 'test', 'Techno');
    expect(result.vision.incantation).toBe("The Void remains silent...");
  });
});
