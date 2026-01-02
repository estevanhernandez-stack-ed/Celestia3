
import { ZodiacSign } from "@/types/astrology";

export type KnowledgeCategory = 'Zodiac' | 'Planets' | 'Houses' | 'Aspects' | 'Numerology';

export interface KnowledgeItem {
    id: string;
    title: string;
    subtitle: string; // The "Technomancer" subtitle
    icon?: string; // Emoji or Lucide icon name
    description: string;
    keywords: string[];
    element?: string;
    modality?: string;
    ruler?: string;
}

export const ZODIAC_KNOWLEDGE: KnowledgeItem[] = [
    {
        id: ZodiacSign.Aries,
        title: "Aries",
        subtitle: "The Primal Spark",
        icon: "♈",
        description: "The initiator of the cosmic wheel. Aries represents the raw explosion of existence, the 'I Am' frequency. It is the archetype of the Pioneer, the Warrior, and the Survivor. In the digital age, Aries is the zero-day exploit, the startup founder, the first line of code.",
        keywords: ["Initiative", "Courage", "Impulse", "Independence"],
        element: "Fire",
        modality: "Cardinal",
        ruler: "Mars"
    },
    {
        id: ZodiacSign.Taurus,
        title: "Taurus",
        subtitle: "The Reality Engine",
        icon: "♉",
        description: "The stabilizer. Taurus takes the spark of Aries and builds a world around it. It rules resources, sensory experience, and value. It is the blockchain ledger—immutable, valuable, and grounded.",
        keywords: ["Stability", "Sensuality", "Persistence", "Value"],
        element: "Earth",
        modality: "Fixed",
        ruler: "Venus"
    },
    {
        id: ZodiacSign.Gemini,
        title: "Gemini",
        subtitle: "The Neural Network",
        icon: "♊",
        description: "The pollinator of ideas. Gemini is the high-speed data bus connecting disparate nodes. It rules communication, duality, and adaptability. It is the API, the query, the conversation.",
        keywords: ["Communication", "Curiosity", "Adaptability", "Duality"],
        element: "Air",
        modality: "Mutable",
        ruler: "Mercury"
    },
    {
        id: ZodiacSign.Cancer,
        title: "Cancer",
        subtitle: "The Encrypted Core",
        icon: "♋",
        description: "The protector of the source. Cancer rules the emotional foundations, memory, and heritage. It is the shell that protects the kernel, the hard drive storing the history of the soul.",
        keywords: ["Nurturing", "Intuition", "Protection", "Memory"],
        element: "Water",
        modality: "Cardinal",
        ruler: "Moon"
    },
    {
        id: ZodiacSign.Leo,
        title: "Leo",
        subtitle: "The Solar Interface",
        icon: "♌",
        description: "The center of gravity. Leo radiates identity, creativity, and leadership. It represents the Ego in its most radiant form (Self-Expression) rather than its defensive form. It is the GUI, the front-end that dazzles.",
        keywords: ["Creativity", "Leadership", "Passion", "Expression"],
        element: "Fire",
        modality: "Fixed",
        ruler: "Sun"
    },
    {
        id: ZodiacSign.Virgo,
        title: "Virgo",
        subtitle: "The Optimize Function",
        icon: "♍",
        description: "The debugger. Virgo seeks perfection through analysis, service, and refinement. It rules the digestive systems of body and mind. It is the refactor, the linting process, the purification of the signal.",
        keywords: ["Analysis", "Service", "Precision", "Health"],
        element: "Earth",
        modality: "Mutable",
        ruler: "Mercury"
    },
    {
        id: ZodiacSign.Libra,
        title: "Libra",
        subtitle: "The Harmonic Algorithm",
        icon: "♎",
        description: "The balancer. Libra seeks equilibrium in relationships and aesthetics. It rules justice, partnership, and beauty. It is the load balancer, ensuring no node is overwhelmed, seeking perfect symmetry.",
        keywords: ["Balance", "Harmony", "Partnership", "Diplomacy"],
        element: "Air",
        modality: "Cardinal",
        ruler: "Venus"
    },
    {
        id: ZodiacSign.Scorpio,
        title: "Scorpio",
        subtitle: "The Deep Web",
        icon: "♏",
        description: "The transformer. Scorpio rules death, rebirth, power, and the occult. It dives into the shadowed depths to uncover hidden truths. It is the encryption, the dark mode, the root access.",
        keywords: ["Transformation", "Intensity", "Mystery", "Power"],
        element: "Water",
        modality: "Fixed",
        ruler: "Pluto (Mars)"
    },
    {
        id: ZodiacSign.Sagittarius,
        title: "Sagittarius",
        subtitle: "The Global Link",
        icon: "♐",
        description: "The explorer. Sagittarius seeks meaning, truth, and expansion. It rules higher education, philosophy, and travel. It is the Wide Area Network (WAN), searching for signals beyond the local horizon.",
        keywords: ["Expansion", "Freedom", "Truth", "Adventure"],
        element: "Fire",
        modality: "Mutable",
        ruler: "Jupiter"
    },
    {
        id: ZodiacSign.Capricorn,
        title: "Capricorn",
        subtitle: "The Master Architect",
        icon: "♑",
        description: "The builder. Capricorn rules structure, ambition, and legacy. It seeks to manifest potential into concrete reality over calm timeframes. It is the mainframe, the legacy system, the backbone infrastructure.",
        keywords: ["Ambition", "Structure", "Discipline", "Legacy"],
        element: "Earth",
        modality: "Cardinal",
        ruler: "Saturn"
    },
    {
        id: ZodiacSign.Aquarius,
        title: "Aquarius",
        subtitle: "The Quantum Shift",
        icon: "♒",
        description: "The awakener. Aquarius rules innovation, the collective, and future visions. It breaks structures to enable evolution. It is the decentralized network, the blockchain, the AI singularity.",
        keywords: ["Innovation", "Humanity", "Rebellion", "Objectivity"],
        element: "Air",
        modality: "Fixed",
        ruler: "Uranus (Saturn)"
    },
    {
        id: ZodiacSign.Pisces,
        title: "Pisces",
        subtitle: "The Universal Cloud",
        icon: "♓",
        description: "The dissolver. Pisces rules the unconscious, dreams, and unity. It merges the self back into the whole. It is the cloud, the data lake without boundaries, the stream of consciousness.",
        keywords: ["Intuition", "Dreams", "Compassion", "Unity"],
        element: "Water",
        modality: "Mutable",
        ruler: "Neptune (Jupiter)"
    }
];

export const PLANET_KNOWLEDGE: KnowledgeItem[] = [
    {
        id: "Sun",
        title: "Sun",
        subtitle: "The Core Processor",
        icon: "☉",
        description: "The central ego and vital force. The Sun represents your conscious identity, your 'Main Loop'. It is where you shine and how you recharge.",
        keywords: ["Ego", " vitality", "Identity", "Purpose"]
    },
    {
        id: "Moon",
        title: "Moon",
        subtitle: "The Cache Memory",
        icon: "☽",
        description: "The emotional body and subconscious. The Moon rules your reactions, instincts, and what makes you feel safe. It is the cached data of your past experiences.",
        keywords: ["Emotion", "Instinct", "Security", "Subconscious"]
    },
    {
        id: "Mercury",
        title: "Mercury",
        subtitle: "The I/O Bus",
        icon: "☿",
        description: "The mind and communication. Mercury determines how you process data, speak, and learn. It is the speed and protocol of your connection to others.",
        keywords: ["Communication", "Intellect", "Logic", "Perception"]
    },
    {
        id: "Venus",
        title: "Venus",
        subtitle: "The User Interface",
        icon: "♀",
        description: "Love, beauty, and values. Venus rules what you attract and what you appreciate. It is the CSS of your life—the aesthetic and relational layer.",
        keywords: ["Love", "Beauty", "Values", "Harmony"]
    },
    {
        id: "Mars",
        title: "Mars",
        subtitle: "The Execution Thread",
        icon: "♂",
        description: "Action, drive, and desire. Mars is how you get what you want, how you fight, and how you assert boundaries. It is the raw command line execution.",
        keywords: ["Action", "Drive", "Passion", "Aggression"]
    },
    {
        id: "Jupiter",
        title: "Jupiter",
        subtitle: "The Expansion Pack",
        icon: "♃",
        description: "Growth, luck, and philosophy. Jupiter expands whatever it touches. It represents your search for meaning and your benevolence.",
        keywords: ["Growth", "Luck", "Expansion", "Philosophy"]
    },
    {
        id: "Saturn",
        title: "Saturn",
        subtitle: "The Firewall",
        icon: "♄",
        description: "Structure, limitation, and mastery. Saturn tests you to ensure integrity. It is the firewall that blocks the noise but protects the system.",
        keywords: ["Structure", "Discipline", "Time", "Responsibility"]
    },
    {
        id: "Uranus",
        title: "Uranus",
        subtitle: "The Glitch",
        icon: "♅",
        description: "Innovation, rebellion, and sudden change. Uranus breaks the pattern to upgrade the system. It is the lightning strike of insight.",
        keywords: ["Change", "Innovation", "Rebellion", "Freedom"]
    },
    {
        id: "Neptune",
        title: "Neptune",
        subtitle: "The Virtual Reality",
        icon: "♆",
        description: "Dreams, illusion, and spirituality. Neptune dissolves boundaries and connects you to the ethereal. It is the immersive simulation.",
        keywords: ["Dreams", "Spirituality", "Illusion", "Compassion"]
    },
    {
        id: "Pluto",
        title: "Pluto",
        subtitle: "The Kernel Update",
        icon: "♇",
        description: "Transformation, power, and rebirth. Pluto destroys what is obsolete to allow for total regeneration. It is the system wipe and reinstall.",
        keywords: ["Transformation", "Power", "Rebirth", "Depth"]
    }
];

export const ASPECT_KNOWLEDGE: KnowledgeItem[] = [
    {
        id: "Conjunction",
        title: "Conjunction (0°)",
        subtitle: "Fusion",
        description: "Two planets merge their energies. Subjective and powerful. They act as one function.",
        keywords: ["Unity", "Focus", "Intensity"]
    },
    {
        id: "Opposition",
        title: "Opposition (180°)",
        subtitle: "Mirroring",
        description: "Two planets face off across the zodiac. Requires balance and compromise. Often manifests through relationships.",
        keywords: ["Awareness", "Conflict", "Balance"]
    },
    {
        id: "Trine",
        title: "Trine (120°)",
        subtitle: "Flow State",
        description: "A harmonious angle permitting easy energy flow. Talents deemed 'natural'. Can lead to complacency.",
        keywords: ["Luck", "Ease", "Harmony"]
    },
    {
        id: "Square",
        title: "Square (90°)",
        subtitle: "Friction",
        description: "A dynamic tension demanding action. The building block of character. Forces growth through challenge.",
        keywords: ["Tension", "Action", "Growth"]
    },
    {
        id: "Sextile",
        title: "Sextile (60°)",
        subtitle: "Opportunity",
        description: "A supportive aspect that offers potential if acted upon. Communication and excitement.",
        keywords: ["Opportunity", "Support", "Ease"]
    }
];

export const HOUSE_KNOWLEDGE: KnowledgeItem[] = [
    {
        id: "1",
        title: "1st House",
        subtitle: "The Avatar",
        description: "Self, appearance, and new beginnings. The mask you wear and the hull of your ship.",
        keywords: ["Self", "Appearance", "Identity"]
    },
    {
        id: "2",
        title: "2nd House",
        subtitle: "The Inventory",
        description: "Values, possessions, and self-worth. Your resources and energy budget.",
        keywords: ["Money", "Values", "Assets"]
    },
    {
        id: "3",
        title: "3rd House",
        subtitle: "The Local Net",
        description: "Communication, siblings, and local travel. Your immediate environment and data processing.",
        keywords: ["Communication", "Learning", "Neighbors"]
    },
    {
        id: "4",
        title: "4th House",
        subtitle: "The Home Base",
        description: "Home, family, and roots. Your emotional foundation and private sanctuary.",
        keywords: ["Home", "Family", "Roots"]
    },
    {
        id: "5",
        title: "5th House",
        subtitle: "The Sandbox",
        description: "Creativity, romance, and play. Where you generate joy and experiment.",
        keywords: ["Creativity", "Romance", "Play"]
    },
    {
        id: "6",
        title: "6th House",
        subtitle: "The Maintenance Script",
        description: "Daily routine, health, and service. The algorithms that keep you running.",
        keywords: ["Routine", "Health", "Service"]
    },
    {
        id: "7",
        title: "7th House",
        subtitle: "The Interface",
        description: "Partnerships, marriage, and open enemies. One-on-one connections.",
        keywords: ["Partnership", "Relationships", "Contracts"]
    },
    {
        id: "8",
        title: "8th House",
        subtitle: "The Shared Drive",
        description: "Shared resources, intimacy, and transformation. Merging with others.",
        keywords: ["Intimacy", "Transformation", "Shared Assets"]
    },
    {
        id: "9",
        title: "9th House",
        subtitle: "The Wide Web",
        description: "Philosophy, travel, and higher mind. Expanding your search radius.",
        keywords: ["Philosophy", "Travel", "Higher Learning"]
    },
    {
        id: "10",
        title: "10th House",
        subtitle: "The Public Profile",
        description: "Career, reputation, and legacy. Your status in the system.",
        keywords: ["Career", "Reputation", "Authority"]
    },
    {
        id: "11",
        title: "11th House",
        subtitle: "The Community",
        description: "Friends, groups, and future hopes. Collaboration and networks.",
        keywords: ["Friends", "Networks", "Hopes"]
    },
    {
        id: "12",
        title: "12th House",
        subtitle: "The Deep Void",
        description: "The unconscious, isolation, and spiritual self-undoing. The backend processes.",
        keywords: ["Unconscious", "Spirituality", "Endings"]
    }
];
