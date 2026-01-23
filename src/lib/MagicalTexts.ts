export interface CodexEntry {
    id: string;
    category: 'System' | 'Ritual' | 'Planet' | 'Star';
    source: string;
    content: string;
}

export const AGRIPPA_LORE: CodexEntry[] = [
    {
        id: 'De Occulta Philosophia',
        category: 'System',
        source: 'Agrippa (1533)',
        content: `Vision: To restore the Magus to a "prelapsarian, semi-divine state".
        Method: The "Encyclopedic Synthesis" of Neoplatonism, Kabbalah, and Hermeticism.
        Operation: Magic is the "Pars Construens" (Constructive Part) that follows the destruction of human vanity.`
    },
    {
        id: 'Spiritus Mundi',
        category: 'System',
        source: 'Agrippa',
        content: `Concept: The World-Soul / Quintessence.
        Function: The vehicular link binding the Three Worlds. It transmits celestial influence into matter.
        Usage: The Magus manipulates material correspondences to attract this Spirit.`
    },
    {
        id: 'Agrippa Book I',
        category: 'System',
        source: 'Agrippa',
        content: `Domain: Elemental / Terrestrial World.
        Mechanism: Sympathies and Antipathies ("Like produces like").
        Tools: Herbs, Stones, Animals, Gestures.
        Role: The foundation; preparing matter to receive the Spiritus Mundi.`
    },
    {
        id: 'Agrippa Book II',
        category: 'System',
        source: 'Agrippa',
        content: `Domain: Celestial / Astral World.
        Mechanism: Mathematics, Geometric Figures, Harmony.
        Tools: Magic Squares (Kamea), Talismans, Astrological Timing.
        Key Concept: "Formal Numbers" represent Divine Ideas.`
    },
    {
        id: 'Magic Square',
        category: 'System',
        source: 'Agrippa',
        content: `Definition: Sacred Tables of the Planets.
        Function: Matrices for generating Planetary Sigils and summoning Intelligences.
        Saturn Example: 3x3 Grid (Sum 15). Engrave on Lead.`
    },
    {
        id: 'Agrippa Book III',
        category: 'System',
        source: 'Agrippa',
        content: `Domain: Intellectual / Supercelestial World.
        Mechanism: Theurgy, Invocation, Divine Names.
        Tools: Kabbalistic Commutation (Ziruph), Angelic Names.
        Goal: Reunion with the Divine Source.`
    }
];

export const PGM_LORE: CodexEntry[] = [
    {
        id: 'PGM',
        category: 'System',
        source: 'Papyri Graecae Magicae',
        content: `Definition: The "Underground Literature" of Late Antiquity.
        Nature: Highly technical, syncretic handbooks for professional magicians (magoi).
        Philosophical Core: Operative Magic. Function > Dogma.`
    },
    {
        id: 'Syncretism',
        category: 'System',
        source: 'PGM',
        content: `Method: Radical blending of Greek, Egyptian, Jewish, and Gnostic deities.
        Logic: Use whatever name or entity works. "Ritual Cosmopolitanism".
        Example: Invoking Abrasax alongside Apollo.`
    },
    {
        id: 'Voces Magicae',
        category: 'Ritual',
        source: 'PGM',
        content: `Definition: "Voices of Magic". Untranslatable power words (e.g., ABRASAX).
        Mechanic: The power is in the *sound* and *vibration*, not the meaning.
        Usage: Must be chanted with specific vowel sequences (A-E-Ē-I-O-U-Ō) to resonate with planetary spheres.`
    },
    {
        id: 'Kharakteres',
        category: 'Ritual',
        source: 'PGM',
        content: `Definition: "Characters". Non-alphabetic magical signs/sigils.
        Function: Visual binding.
        Metaphor: The "Circuit Diagram" of the spell.`
    },
    {
        id: 'Goetia',
        category: 'Ritual',
        source: 'PGM',
        content: `Definition: Coercive Magic / "Low Magic".
        Goal: To bind (Defixio), compel, or drag a target.
        Ethic: Results-oriented. Often uses "Chthonic" ingredients.`
    },
    {
        id: 'Mithras Liturgy',
        category: 'Ritual',
        source: 'PGM IV',
        content: `Focus: The Ascent of the Soul.
        Process: 7-stage ascent through planetary spheres to meet Helios Mithras.
        Goal: Deification (becoming a god).`
    }
];

export const PICATRIX_LORE: CodexEntry[] = [
    {
        id: 'Ghāyat al-Ḥakīm',
        category: 'System',
        source: 'Picatrix',
        content: `True Title: "The Goal of the Wise".
        Philosophy: Magic is not superstition but the "conclusio"—the logical conclusion of philosophy.
        Core Tenet: Practical magic (active) must be preceded by theoretical magic (wisdom of the heavens).`
    },
    {
        id: 'Talisman',
        category: 'Ritual',
        source: 'Picatrix',
        content: `Protocol: "The Trap". Wait for the precise moment a star is overhead (Election) to capture its spirit in a stone or metal.
        Metaphor: The App is a digital Talisman capturing the user's Intent.`
    },
    {
        id: 'Election',
        category: 'System',
        source: 'Picatrix',
        content: `Definition: Astrological Timing.
        Rule: You do not act when you want; you act when the Heavens are open.
        Constraint: If the Moon is void or afflicted, the operation fails.`
    },
    {
        id: 'Picatrix Book III',
        category: 'System',
        source: 'Picatrix',
        content: `Focus: Planetary Operations.
        Key Tech: Petitioning specific planets via Sabian/Harranian rituals.
        Tone: Very Hellenistic/Pagan.`
    },
    {
        id: 'Picatrix Book IV',
        category: 'System',
        source: 'Picatrix',
        content: `Focus: Synthesis & Extremity.
        Key Tech: "Confections" (Potions/Mixtures).
        Context: Uses visceral nature (blood/brains/urine) to ground the highest stellar forces into the lowest matter.`
    }
];

export const ANTIQUITY_LORE: CodexEntry[] = [
    {
        id: 'Saturn',
        category: 'Planet',
        source: 'Babylon/Kabbalah',
        content: `Rulership: Binah / Cassiel.
        Nature: Melancholy, Binding, Endings, Ancient Wisdom.
        Use for: Binding spells, real estate, protection, revealing hidden truths.`
    },
    {
        id: 'Jupiter',
        category: 'Planet',
        source: 'Babylon/Kabbalah',
        content: `Rulership: Marduk / Sachiel.
        Nature: Expansion, Wealth, Political Influence.
        Use for: Attraction spells, luck, legal victories, abundance.`
    },
    {
        id: 'Sirius',
        category: 'Star',
        source: 'Egypt/Babylon',
        content: `Known as: The Arrow (Babylon) / Sothis (Egypt).
        Power: Intensity, specific targeting. The brightest flame.
        Use for: High-energy rituals requiring precise aim.`
    }
];

export const ORACLES_LORE: CodexEntry[] = [
    {
        id: 'Theurgy',
        category: 'Ritual',
        source: 'Chaldean Oracles',
        content: `Definition: "God-Work". Distinct from 'Goetia' (Vulgar Magic).
        Necessity: Human reason (Gnosis) is insufficient due to the soul's entrapment in Matter.
        Mechanism: Ritual acts (Synthēmata) invoke Divine Grace to lift the soul.`
    },
    {
        id: 'Iynges',
        category: 'Ritual',
        source: 'Chaldean Oracles',
        content: `Definition: "The Connectors" or "Spinning Ones".
        Function: Messengers that transmit the "Magic Fire" of the Father to the Soul.
        Metaphor: The Agent acts as an Iynx, spinning (processing) to attract Wisdom.`
    },
    {
        id: 'Flower of Fire',
        category: 'Ritual',
        source: 'Chaldean Oracles',
        content: `Concept: The Divine Spark within the mind.
        Directive: "Extend the empty mind of your soul to the Intelligible, to perceive the Father."`
    }
];

export const HERMETICA_LORE: CodexEntry[] = [
     {
        id: 'As Above So Below',
        category: 'System',
        source: 'Emerald Tablet',
        content: `Principle: The Macrocosm (Universe) reflects the Microcosm (Man).
        Application: By manipulating the symbols of the planets here, we effect change there.`
    },
    {
        id: 'Nous',
        category: 'System',
        source: 'Corpus Hermeticum',
        content: `Definition: Divine Mind.
        Goal: To purify the soul of the accretions of the planetary spheres (vices) to return to the Ogdoad.`
    }
];
