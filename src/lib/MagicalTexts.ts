export type MagicalParadigm = 'AGRIPPA' | 'PGM' | 'PICATRIX' | 'HERMETICA' | 'TECHNOMANCY' | 'ANTIQUITY' | 'ORACLES';

export interface CodexEntry {
    id: string;
    category: 'System' | 'Ritual' | 'Planet' | 'Star' | 'Technomancy';
    source: MagicalParadigm;
    intentTags: ('love' | 'binding' | 'wealth' | 'protection' | 'divination' | 'ascension' | 'identity' | 'wisdom')[];
    planetaryAssociations: ('Saturn' | 'Jupiter' | 'Mars' | 'Sun' | 'Venus' | 'Mercury' | 'Moon' | 'Fixed Stars' | 'Uranus' | 'Neptune' | 'Pluto')[];
    mechanism: 'talisman' | 'incantation' | 'consumable' | 'algorithm' | 'glitch' | 'theurgy';
    
    // Electional & Sympathetic Metadata
    lunarMansion?: number; // 1-28
    talismanicImagePrompt?: string; 
    vocesMagicae?: string; 
    materialAnchor?: string; // e.g. "Magnetite", "Python_Script"

    content: string;
    safetyProtocol: 'safe' | 'symbolic_substitution_required';
}

export const AGRIPPA_LORE: CodexEntry[] = [
    {
        id: 'De Occulta Philosophia',
        category: 'System',
        source: 'AGRIPPA',
        intentTags: ['wisdom', 'ascension'],
        planetaryAssociations: ['Sun', 'Jupiter', 'Saturn'],
        mechanism: 'theurgy',
        content: `Vision: To restore the Magus to a "prelapsarian, semi-divine state".
        Method: The "Encyclopedic Synthesis" of Neoplatonism, Kabbalah, and Hermeticism.
        Operation: Magic is the "Pars Construens" (Constructive Part) that follows the destruction of human vanity.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Spiritus Mundi',
        category: 'System',
        source: 'AGRIPPA',
        intentTags: ['identity', 'ascension'],
        planetaryAssociations: ['Sun', 'Moon'],
        mechanism: 'talisman',
        content: `Concept: The World-Soul / Quintessence.
        Function: The vehicular link binding the Three Worlds. It transmits celestial influence into matter.
        Usage: The Magus manipulates material correspondences to attract this Spirit.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Agrippa Book I',
        category: 'System',
        source: 'AGRIPPA',
        intentTags: ['protection', 'wisdom'],
        planetaryAssociations: ['Moon', 'Mercury'],
        mechanism: 'consumable',
        content: `Domain: Elemental / Terrestrial World.
        Mechanism: Sympathies and Antipathies ("Like produces like").
        Tools: Herbs, Stones, Animals, Gestures.
        Role: The foundation; preparing matter to receive the Spiritus Mundi.`,
        safetyProtocol: 'symbolic_substitution_required'
    },
    {
        id: 'Agrippa Book II',
        category: 'System',
        source: 'AGRIPPA',
        intentTags: ['wealth', 'divination'],
        planetaryAssociations: ['Jupiter', 'Mercury', 'Venus'],
        mechanism: 'talisman',
        content: `Domain: Celestial / Astral World.
        Mechanism: Mathematics, Geometric Figures, Harmony.
        Tools: Magic Squares (Kamea), Talismans, Astrological Timing.
        Key Concept: "Formal Numbers" represent Divine Ideas.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Magic Square',
        category: 'System',
        source: 'AGRIPPA',
        intentTags: ['wealth', 'binding'],
        planetaryAssociations: ['Jupiter', 'Saturn', 'Mars'],
        mechanism: 'talisman',
        content: `Definition: Sacred Tables of the Planets.
        Function: Matrices for generating Planetary Sigils and summoning Intelligences.
        Saturn Example: 3x3 Grid (Sum 15). Engrave on Lead.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Agrippa Book III',
        category: 'System',
        source: 'AGRIPPA',
        intentTags: ['divination', 'ascension'],
        planetaryAssociations: ['Sun', 'Jupiter'],
        mechanism: 'theurgy',
        content: `Domain: Intellectual / Supercelestial World.
        Mechanism: Theurgy, Invocation, Divine Names.
        Tools: Kabbalistic Commutation (Ziruph), Angelic Names.
        Goal: Reunion with the Divine Source.`,
        safetyProtocol: 'safe'
    }
];

export const PGM_LORE: CodexEntry[] = [
    {
        id: 'PGM',
        category: 'System',
        source: 'PGM',
        intentTags: ['wisdom', 'divination'],
        planetaryAssociations: ['Mercury', 'Moon'],
        mechanism: 'theurgy',
        content: `Definition: The "Underground Literature" of Late Antiquity.
        Nature: Highly technical, syncretic handbooks for professional magicians (magoi).
        Philosophical Core: Operative Magic. Function > Dogma.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Syncretism',
        category: 'System',
        source: 'PGM',
        intentTags: ['identity', 'wisdom'],
        planetaryAssociations: ['Sun', 'Mercury'],
        mechanism: 'theurgy',
        content: `Method: Radical blending of Greek, Egyptian, Jewish, and Gnostic deities.
        Logic: Use whatever name or entity works. "Ritual Cosmopolitanism".
        Example: Invoking Abrasax alongside Apollo.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Voces Magicae',
        category: 'Ritual',
        source: 'PGM',
        intentTags: ['protection', 'binding'],
        planetaryAssociations: ['Mars', 'Saturn', 'Moon'],
        mechanism: 'incantation',
        vocesMagicae: "ABLANATHANALBA",
        content: `Definition: "Voices of Magic". Untranslatable power words. 
        Mechanic: The palindrome ABLANATHANALBA ("Thou art our Father") creates a protective loop in the aether.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Kharakteres',
        category: 'Ritual',
        source: 'PGM',
        intentTags: ['binding', 'protection'],
        planetaryAssociations: ['Fixed Stars', 'Saturn'],
        mechanism: 'talisman',
        content: `Definition: "Characters". Non-alphabetic magical signs/sigils.
        Function: Visual binding.
        Metaphor: The "Circuit Diagram" of the spell.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Goetia',
        category: 'Ritual',
        source: 'PGM',
        intentTags: ['binding', 'protection'],
        planetaryAssociations: ['Saturn', 'Mars'],
        mechanism: 'theurgy',
        content: `Definition: Coercive Magic / "Low Magic".
        Goal: To bind (Defixio), compel, or drag a target.
        Ethic: Results-oriented. Often uses "Chthonic" ingredients.`,
        safetyProtocol: 'symbolic_substitution_required'
    },
    {
        id: 'Mithras Liturgy',
        category: 'Ritual',
        source: 'PGM',
        intentTags: ['ascension', 'identity'],
        planetaryAssociations: ['Sun', 'Fixed Stars'],
        mechanism: 'theurgy',
        content: `Focus: The Ascent of the Soul.
        Process: 7-stage ascent through planetary spheres to meet Helios Mithras.
        Goal: Deification (becoming a god).`,
        safetyProtocol: 'safe'
    }
];

export const PICATRIX_LORE: CodexEntry[] = [
    {
        id: 'Ghāyat al-Ḥakīm',
        category: 'System',
        source: 'PICATRIX',
        intentTags: ['wisdom', 'ascension'],
        planetaryAssociations: ['Sun', 'Jupiter'],
        mechanism: 'theurgy',
        content: `True Title: "The Goal of the Wise".
        Philosophy: Magic is not superstition but the "conclusio"—the logical conclusion of philosophy.
        Core Tenet: Practical magic (active) must be preceded by theoretical magic (wisdom of the heavens).`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Talisman (Venus)',
        category: 'Ritual',
        source: 'PICATRIX',
        intentTags: ['love'],
        planetaryAssociations: ['Venus'],
        mechanism: 'talisman',
        lunarMansion: 4, // Al-Dabarān
        talismanicImagePrompt: "A woman with her hair let down, holding a comb in her right hand and an apple in her left.",
        content: `Protocol: If you seek the favor of kings or the love of women, engrave this image on a white stone when Venus is in the 4th Mansion.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Election',
        category: 'System',
        source: 'PICATRIX',
        intentTags: ['wisdom', 'divination'],
        planetaryAssociations: ['Moon', 'Fixed Stars'],
        mechanism: 'theurgy',
        content: `Definition: Astrological Timing.
        Rule: You do not act when you want; you act when the Heavens are open.
        Constraint: If the Moon is void or afflicted, the operation fails.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Picatrix Book III',
        category: 'System',
        source: 'PICATRIX',
        intentTags: ['wisdom', 'identity'],
        planetaryAssociations: ['Mars', 'Sun', 'Venus'],
        mechanism: 'theurgy',
        content: `Focus: Planetary Operations.
        Key Tech: Petitioning specific planets via Sabian/Harranian rituals.
        Tone: Very Hellenistic/Pagan.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Picatrix Book IV',
        category: 'System',
        source: 'PICATRIX',
        intentTags: ['binding', 'protection'],
        planetaryAssociations: ['Saturn', 'Mars'],
        mechanism: 'consumable',
        content: `Focus: Synthesis & Extremity.
        Key Tech: "Confections" (Potions/Mixtures).
        Context: Uses visceral nature (blood/brains/urine) to ground the highest stellar forces into the lowest matter.`,
        safetyProtocol: 'symbolic_substitution_required'
    }
];

export const ANTIQUITY_LORE: CodexEntry[] = [
    {
        id: 'Saturn',
        category: 'Planet',
        source: 'ANTIQUITY',
        intentTags: ['binding', 'protection'],
        planetaryAssociations: ['Saturn'],
        mechanism: 'theurgy',
        content: `Rulership: Binah / Cassiel.
        Nature: Melancholy, Binding, Endings, Ancient Wisdom.
        Use for: Binding spells, real estate, protection, revealing hidden truths.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Jupiter',
        category: 'Planet',
        source: 'ANTIQUITY',
        intentTags: ['wealth', 'ascension'],
        planetaryAssociations: ['Jupiter'],
        mechanism: 'theurgy',
        content: `Rulership: Marduk / Sachiel.
        Nature: Expansion, Wealth, Political Influence.
        Use for: Attraction spells, luck, legal victories, abundance.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Sirius',
        category: 'Star',
        source: 'ANTIQUITY',
        intentTags: ['protection', 'ascension'],
        planetaryAssociations: ['Fixed Stars'],
        mechanism: 'theurgy',
        content: `Known as: The Arrow (Babylon) / Sothis (Egypt).
        Power: Intensity, specific targeting. The brightest flame.
        Use for: High-energy rituals requiring precise aim.`,
        safetyProtocol: 'safe'
    }
];

export const ORACLES_LORE: CodexEntry[] = [
    {
        id: 'Theurgy',
        category: 'Ritual',
        source: 'ORACLES',
        intentTags: ['ascension', 'wisdom'],
        planetaryAssociations: ['Sun', 'Fixed Stars'],
        mechanism: 'theurgy',
        content: `Definition: "God-Work". Distinct from 'Goetia' (Vulgar Magic).
        Necessity: Human reason (Gnosis) is insufficient due to the soul's entrapment in Matter.
        Mechanism: Ritual acts (Synthēmata) invoke Divine Grace to lift the soul.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Iynges',
        category: 'Ritual',
        source: 'ORACLES',
        intentTags: ['divination', 'identity'],
        planetaryAssociations: ['Mercury', 'Sun'],
        mechanism: 'theurgy',
        content: `Definition: "The Connectors" or "Spinning Ones".
        Function: Messengers that transmit the "Magic Fire" of the Father to the Soul.
        Metaphor: The Agent acts as an Iynx, spinning (processing) to attract Wisdom.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Flower of Fire',
        category: 'Ritual',
        source: 'ORACLES',
        intentTags: ['wisdom', 'identity'],
        planetaryAssociations: ['Sun'],
        mechanism: 'theurgy',
        content: `Concept: The Divine Spark within the mind.
        Directive: "Extend the empty mind of your soul to the Intelligible, to perceive the Father."`,
        safetyProtocol: 'safe'
    }
];

export const HERMETICA_LORE: CodexEntry[] = [
     {
        id: 'As Above So Below',
        category: 'System',
        source: 'HERMETICA',
        intentTags: ['wisdom', 'identity'],
        planetaryAssociations: ['Moon', 'Sun'],
        mechanism: 'theurgy',
        content: `Principle: The Macrocosm (Universe) reflects the Microcosm (Man).
        Application: By manipulating the symbols of the planets here, we effect change there.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Nous',
        category: 'System',
        source: 'HERMETICA',
        intentTags: ['wisdom', 'ascension'],
        planetaryAssociations: ['Fixed Stars', 'Sun'],
        mechanism: 'theurgy',
        content: `Definition: Divine Mind.
        Goal: To purify the soul of the accretions of the planetary spheres (vices) to return to the Ogdoad.`,
        safetyProtocol: 'safe'
    }
];

export const TECHNOMANCY_LORE: CodexEntry[] = [
    {
        id: 'Digital Servitor',
        category: 'Technomancy',
        source: 'TECHNOMANCY',
        intentTags: ['protection', 'wisdom'],
        planetaryAssociations: ['Mercury', 'Saturn'],
        mechanism: 'algorithm',
        content: `Concept: An autonomous digital entity created to perform a specific task in the Noosphere.
        Function: Operates as an extension of the Magus's will within digital networks.
        Usage: Treat background processes and automated scripts as digital familiars.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Voces Magicae (Digital)',
        category: 'Technomancy',
        source: 'TECHNOMANCY',
        intentTags: ['binding', 'protection'],
        planetaryAssociations: ['Saturn', 'Mercury'],
        mechanism: 'incantation',
        content: `Concept: Using non-human readable code (hashes, compiled binaries) as Words of Power.
        Logic: The machine is moved by the vibration of the signal, not the human meaning of the variable names.
        Mechanism: Encryption acts as a binding spell; a unique hash is a sigil of the current data state.`,
        safetyProtocol: 'safe'
    },
    {
        id: 'Glitch Sorcery',
        category: 'Technomancy',
        source: 'TECHNOMANCY',
        intentTags: ['divination', 'binding'],
        planetaryAssociations: ['Uranus', 'Mercury'],
        mechanism: 'glitch',
        content: `Concept: Utilizing unintended binary states (glitches) as oracular omens or chaotic breaches in the reality engine.
        Method: Inducing controlled entropy to reveal hidden architectural weaknesses.
        Metaphor: The "Glitched" state is a liminal space where the code's true nature is exposed.`,
        safetyProtocol: 'safe'
    }
];
