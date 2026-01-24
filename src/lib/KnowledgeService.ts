import { 
    ZODIAC_KNOWLEDGE, 
    PLANET_KNOWLEDGE, 
    HOUSE_KNOWLEDGE, 
    ASPECT_KNOWLEDGE, 
    NUMEROLOGY_KNOWLEDGE,
    STAR_KNOWLEDGE,
    MANSION_KNOWLEDGE,
    KnowledgeItem
} from "./KnowledgeBaseData";

export class KnowledgeService {
    /**
     * Formats all knowledge categories into a single context string for the AI.
     */
    static getGlobalKnowledgeContext(focus?: string): string {
        const sections = [
            this.formatSection("Zodiac Archetypes", ZODIAC_KNOWLEDGE),
            this.formatSection("Planetary Forces", PLANET_KNOWLEDGE),
            this.formatSection("Houses of Life", HOUSE_KNOWLEDGE),
            this.formatSection("Aspects", ASPECT_KNOWLEDGE),
            this.formatSection("Arithmancy & Vibrations", NUMEROLOGY_KNOWLEDGE),
            this.formatSection("Fixed Stars", STAR_KNOWLEDGE),
            this.formatSection("Lunar Mansions", MANSION_KNOWLEDGE)
        ];

        let context = sections.join("\n\n");

        if (focus) {
            context = `[PRIORITY KNOWLEDGE FOCUS: ${focus}]\n\n` + context;
        }

        return context;
    }

    private static formatSection(title: string, items: KnowledgeItem[]): string {
        return `[COSMIC CODEX: ${title.toUpperCase()}]\n` + items.map(item => 
            `- ${item.title} (${item.subtitle}): ${item.description} Keywords: ${item.keywords?.join(', ')}`
        ).join('\n');
    }

    /**
     * Attempts to find a specific knowledge item by ID across all categories.
     */
    static getSpecificKnowledge(id: string): KnowledgeItem | undefined {
        const allItems = [
            ...ZODIAC_KNOWLEDGE,
            ...PLANET_KNOWLEDGE,
            ...HOUSE_KNOWLEDGE,
            ...ASPECT_KNOWLEDGE,
            ...NUMEROLOGY_KNOWLEDGE,
            ...STAR_KNOWLEDGE,
            ...MANSION_KNOWLEDGE
        ];
        return allItems.find(item => item.id === id);
    }
}
