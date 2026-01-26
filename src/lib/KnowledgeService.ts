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
import { 
    AGRIPPA_LORE, 
    PGM_LORE, 
    PICATRIX_LORE, 
    ANTIQUITY_LORE, 
    ORACLES_LORE, 
    HERMETICA_LORE,
    TECHNOMANCY_LORE
} from "./MagicalTexts";

export interface QueryCriteria {
    intent?: string;
    planet?: string;
    mechanism?: string;
}

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
     * Returns the entire magical archive for long-context Gemini-3 processing.
     */
    static getTotalArchive(): string {
        const libraries = [
            { name: 'AGRIPPA', lore: AGRIPPA_LORE },
            { name: 'PGM', lore: PGM_LORE },
            { name: 'PICATRIX', lore: PICATRIX_LORE },
            { name: 'ANTIQUITY', lore: ANTIQUITY_LORE },
            { name: 'ORACLES', lore: ORACLES_LORE },
            { name: 'HERMETICA', lore: HERMETICA_LORE },
            { name: 'TECHNOMANCY', lore: TECHNOMANCY_LORE }
        ];

        return libraries.map(lib => 
            `=== SOURCE ARCHIVE: ${lib.name} ===\n` + 
            lib.lore.map(entry => `> [${entry.id}] (${entry.mechanism}): ${entry.content}`).join('\n')
        ).join('\n\n');
    }

    /**
     * Filters magical lore based on current intent or celestial weather.
     */
    static queryMagicalLore(criteria: QueryCriteria): string {
        const allLore = [
            ...AGRIPPA_LORE,
            ...PGM_LORE,
            ...PICATRIX_LORE,
            ...ANTIQUITY_LORE,
            ...ORACLES_LORE,
            ...HERMETICA_LORE,
            ...TECHNOMANCY_LORE
        ];

        const filtered = allLore.filter(entry => {
            const matchIntent = criteria.intent ? entry.intentTags.some(t => t.toLowerCase() === criteria.intent?.toLowerCase()) : true;
            const matchPlanet = criteria.planet ? entry.planetaryAssociations.some(p => p.toLowerCase() === criteria.planet?.toLowerCase()) : true;
            const matchMechanism = criteria.mechanism ? entry.mechanism.toLowerCase() === criteria.mechanism?.toLowerCase() : true;
            return matchIntent && matchPlanet && matchMechanism;
        });

        if (filtered.length === 0) return "";

        return `[RELEVANT MAGICAL TRADITIONS]\n` + filtered.map(f => 
            `* [${f.source}] ${f.id}: ${f.content} (${f.mechanism.toUpperCase()} protocol)`
        ).join('\n');
    }

    /**
     * Smart Lore Injection: Returns a focused subset of the archive based on 
     * the user's dominant planets and intent. Much smaller than getTotalArchive().
     * @param planets - Array of planet names (e.g., ['Sun', 'Moon', 'Mars'])
     * @param intent - Optional user intent (e.g., 'love', 'wealth', 'wisdom')
     */
    static getSmartLore(planets: string[], intent?: string): string {
        const allLore = [
            ...AGRIPPA_LORE,
            ...PGM_LORE,
            ...PICATRIX_LORE,
            ...ANTIQUITY_LORE,
            ...ORACLES_LORE,
            ...HERMETICA_LORE,
            ...TECHNOMANCY_LORE
        ];

        // Filter by planets OR intent (not AND, to be inclusive)
        const filtered = allLore.filter(entry => {
            const matchPlanet = planets.some(p => 
                entry.planetaryAssociations.some(pa => pa.toLowerCase() === p.toLowerCase())
            );
            const matchIntent = intent ? entry.intentTags.some(t => t.toLowerCase() === intent.toLowerCase()) : false;
            return matchPlanet || matchIntent;
        });

        // Limit to prevent timeout (max ~20 entries)
        const limited = filtered.slice(0, 20);

        if (limited.length === 0) {
            // Fallback: Return the Hermetic Primer
            return this.getHermeticPrimer();
        }

        return `[FOCUSED MAGICAL ARCHIVE]\n` + limited.map(f => 
            `* [${f.source}] ${f.id}: ${f.content}`
        ).join('\n');
    }

    /**
     * A condensed ~1KB summary of core Hermetic principles for general queries.
     */
    static getHermeticPrimer(): string {
        return `[HERMETIC PRIMER]
* AS ABOVE, SO BELOW: The Macrocosm (Universe) reflects the Microcosm (Man). Manipulating symbols here effects change there.
* SPIRITUS MUNDI: The World-Soul/Quintessence links the Three Worlds. Material correspondences attract this Spirit.
* THE THREE WORLDS: Elemental (Matter), Celestial (Stars), Intellectual (Divine). Magic ascends through all three.
* THEURGY: "God-Work" distinct from vulgar magic. Ritual acts invoke Divine Grace to lift the soul.
* ELECTION: Astrological timing. You act when the Heavens are open, not when you want.
* VOCES MAGICAE: Words of Power. Untranslatable sounds that vibrate the aether.`;
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
