
import { ZodiacSign } from "@/types/astrology";

export type KnowledgeCategory = 'Zodiac' | 'Planets' | 'Houses' | 'Aspects' | 'Numerology' | 'Stars' | 'Mansions';

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
        subtitle: "The Primal Flame",
        icon: "♈",
        description: "The initiator of the cosmic wheel. Aries represents the raw explosion of existence, the 'I Am' frequency. It is the archetype of the Pioneer, the Warrior, and the Spirit of New Beginnings. It is the point of origin, the first light appearing upon the horizon of the soul.",
        keywords: ["Initiative", "Courage", "Impulse", "Independence"],
        element: "Fire",
        modality: "Cardinal",
        ruler: "Mars"
    },
    {
        id: ZodiacSign.Taurus,
        title: "Taurus",
        subtitle: "The Alchemical Stabilizer",
        icon: "♉",
        description: "The sustainer. Taurus takes the spark of Aries and builds a garden around it. It rules the senses, material beauty, and value. It is the fertile soil, the immutable crystalline structure of the earth, and the wealth of the senses.",
        keywords: ["Stability", "Sensuality", "Persistence", "Value"],
        element: "Earth",
        modality: "Fixed",
        ruler: "Venus"
    },
    {
        id: ZodiacSign.Gemini,
        title: "Gemini",
        subtitle: "The Celestial Messenger",
        icon: "♊",
        description: "The pollinator of ideas. Gemini is the quicksilver current connecting disparate minds. It rules communication, duality, and the play of symbols. It is the spoken word, the shared thought, and the bridge of understanding.",
        keywords: ["Communication", "Curiosity", "Adaptability", "Duality"],
        element: "Air",
        modality: "Mutable",
        ruler: "Mercury"
    },
    {
        id: ZodiacSign.Cancer,
        title: "Cancer",
        subtitle: "The Silver Vessel",
        icon: "♋",
        description: "The protector of the source. Cancer rules the temple of the heart, memory, and heritage. It is the sanctuary that guards the inner life, the chamber of reflection where the past is kept sacred.",
        keywords: ["Nurturing", "Intuition", "Protection", "Memory"],
        element: "Water",
        modality: "Cardinal",
        ruler: "Moon"
    },
    {
        id: ZodiacSign.Leo,
        title: "Leo",
        subtitle: "The Solar Witness",
        icon: "♌",
        description: "The center of radiance. Leo manifests identity, creativity, and the sovereign heart. It represents the soul's light in its most expressive form. It is the crown of the self, the radiant face shown to the world.",
        keywords: ["Creativity", "Leadership", "Passion", "Expression"],
        element: "Fire",
        modality: "Fixed",
        ruler: "Sun"
    },
    {
        id: ZodiacSign.Virgo,
        title: "Virgo",
        subtitle: "The Sacred Weaver",
        icon: "♍",
        description: "The refiner. Virgo seeks wisdom through analysis, service, and ritual purification. It rules the alchemy of the body and mind. It is the precise needle, the careful distillation of truth from the mundane.",
        keywords: ["Analysis", "Service", "Precision", "Health"],
        element: "Earth",
        modality: "Mutable",
        ruler: "Mercury"
    },
    {
        id: ZodiacSign.Libra,
        title: "Libra",
        subtitle: "The Scales of Equilibrium",
        icon: "♎",
        description: "The balancer. Libra seeks peace in relationships and aesthetics. It rules the harmony of opposites and the beauty of symmetry. It is the eternal balance, ensuring every soul is seen and every heart is weighted fairly.",
        keywords: ["Balance", "Harmony", "Partnership", "Diplomacy"],
        element: "Air",
        modality: "Cardinal",
        ruler: "Venus"
    },
    {
        id: ZodiacSign.Scorpio,
        title: "Scorpio",
        subtitle: "The Hidden Depths",
        icon: "♏",
        description: "The transformer. Scorpio rules death, rebirth, power, and the mysteries of the occult. It dives into the shadowed waters to uncover secrets of the soul. It is the initiation, the phoenix rise, the direct connection to the source.",
        keywords: ["Transformation", "Intensity", "Mystery", "Power"],
        element: "Water",
        modality: "Fixed",
        ruler: "Pluto (Mars)"
    },
    {
        id: ZodiacSign.Sagittarius,
        title: "Sagittarius",
        subtitle: "The Infinite Horizon",
        icon: "♐",
        description: "The explorer. Sagittarius seeks meaning, truth, and spiritual expansion. It rules higher philosophy, wisdom, and the journey. It is the flight of the arrow, seeking signals beyond the edges of the known world.",
        keywords: ["Expansion", "Freedom", "Truth", "Adventure"],
        element: "Fire",
        modality: "Mutable",
        ruler: "Jupiter"
    },
    {
        id: ZodiacSign.Capricorn,
        title: "Capricorn",
        subtitle: "The High Architect",
        icon: "♑",
        description: "The builder. Capricorn rules structure, ambition, and the legacy of time. It seeks to manifest the divine into concrete, lasting reality. It is the foundation stone, the mountain peak, and the wisdom of the elders.",
        keywords: ["Ambition", "Structure", "Discipline", "Legacy"],
        element: "Earth",
        modality: "Cardinal",
        ruler: "Saturn"
    },
    {
        id: ZodiacSign.Aquarius,
        title: "Aquarius",
        subtitle: "The Celestial Rebellion",
        icon: "♒",
        description: "The awakener. Aquarius rules innovation, the collective human spirit, and future visions. It breaks stale forms to enable evolution. It is the lightning of insight and the shared heart of humanity.",
        keywords: ["Innovation", "Humanity", "Rebellion", "Objectivity"],
        element: "Air",
        modality: "Fixed",
        ruler: "Uranus (Saturn)"
    },
    {
        id: ZodiacSign.Pisces,
        title: "Pisces",
        subtitle: "The Ocean of Oneness",
        icon: "♓",
        description: "The dissolver. Pisces rules the unconscious, dreams, and divine unity. It merges the separate self back into the great whole. It is the mist, the boundless sea of spirit, and the dream that dreams us all.",
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
        subtitle: "The Solar Intellect",
        icon: "☉",
        description: "The core identity and vital flame. The Sun represents your conscious purpose, the radiant light of your will. It is the source of your strength and the centerpiece of your soul's journey.",
        keywords: ["Ego", " vitality", "Identity", "Purpose"]
    },
    {
        id: "Moon",
        title: "Moon",
        subtitle: "The Inner Mirror",
        icon: "☽",
        description: "The emotional body and deep instincts. The Moon rules your tidal shifts, your needs, and your sense of sanctuary. It is the vessel of your memory and the comfort of your nightly peace.",
        keywords: ["Emotion", "Instinct", "Security", "Subconscious"]
    },
    {
        id: "Mercury",
        title: "Mercury",
        subtitle: "The Golden Tongue",
        icon: "☿",
        description: "The mind and the bridge of communication. Mercury determines how you craft your words, how you learn, and how you perceive the world. It is the wind of thought and the quick silver of intelligence.",
        keywords: ["Communication", "Intellect", "Logic", "Perception"]
    },
    {
        id: "Venus",
        title: "Venus",
        subtitle: "The Sovereign Grace",
        icon: "♀",
        description: "Love, beauty, and the magnetism of the heart. Venus rules what you draw toward you and what you cherish. It is the silk of your life—the aesthetic and relational layer of existence.",
        keywords: ["Love", "Beauty", "Values", "Harmony"]
    },
    {
        id: "Mars",
        title: "Mars",
        subtitle: "The Spear of Will",
        icon: "♂",
        description: "Action, courage, and desire. Mars is how you forge your path, how you defend your bounds, and how you assert your presence. It is the raw drive toward accomplishment.",
        keywords: ["Action", "Drive", "Passion", "Aggression"]
    },
    {
        id: "Jupiter",
        title: "Jupiter",
        subtitle: "The Horn of Plenty",
        icon: "♃",
        description: "Growth, wisdom, and the abundance of the cosmos. Jupiter expands whatever it touches, bringing fortune and higher understanding. It represents your search for meaning and your inherent generosity.",
        keywords: ["Growth", "Luck", "Expansion", "Philosophy"]
    },
    {
        id: "Saturn",
        title: "Saturn",
        subtitle: "The Threshold Guardian",
        icon: "♄",
        description: "Structure, discipline, and the mastery of time. Saturn tests you to ensure spiritual integrity. It is the silent mentor that bounds the chaos and demands the excellence of your efforts.",
        keywords: ["Structure", "Discipline", "Time", "Responsibility"]
    },
    {
        id: "Uranus",
        title: "Uranus",
        subtitle: "The Sudden Insight",
        icon: "♅",
        description: "Innovation, liberation, and the breaking of chains. Uranus shatters old forms to usher in the new. It is the flash of inspiration that changes everything in an instant.",
        keywords: ["Change", "Innovation", "Rebellion", "Freedom"]
    },
    {
        id: "Neptune",
        title: "Neptune",
        subtitle: "The Veiled Vision",
        icon: "♆",
        description: "Dreams, mysticism, and the dissolution of ego. Neptune connects you to the collective soul and the waters of inspiration. It is the divine daydream and the oceanic peace.",
        keywords: ["Dreams", "Spirituality", "Illusion", "Compassion"]
    },
    {
        id: "Pluto",
        title: "Pluto",
        subtitle: "The Primal Rebirth",
        icon: "♇",
        description: "Transformation, power, and the purging of the old. Pluto burns away what is obsolete to allow for total spiritual renewal. It is the death that precedes the grandest life.",
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

export const PARADIGM_INSTRUCTIONS: Record<string, string> = {
    'Antiquity': "Analyze charts using Traditional Astrology (Hellenistic/Medieval). Focus on planetary condition, sect, and essential dignity (rulership, exaltation). Avoid modern psychological fluff.",
    'Picatrix': "Draw upon the *Ghayat al-Hakim*. Focus on talismanic imagery, the spirit of the planets, and elective timing for magical operations. Use visceral, sensory descriptions.",
    'Agrippa': "Draw upon the *Three Books of Occult Philosophy*. Use celestial hierarchies, elemental correspondences, and the connection between the natural, celestial, and intellectual worlds.",
    'PGM': "Draw upon the *Greek Magical Papyri*. Use barbarous names of power, syncretic deity invocations, and raw, primal magical language. Focus on results and direct intervention.",
    'Oracles': "Speak in riddles and poetic omens. Use the language of the Chaldean Oracles. Focus on the 'flower of fire' and the mysteries of the soul's ascent.",
    'Hermetica': "Draw upon the *Corpus Hermeticum*. Keep a distinct focus on 'As Above, So Below'. Emphasize the divine mind (Nous) and the purification of the soul through the planetary spheres."
};

export const NUMEROLOGY_KNOWLEDGE: KnowledgeItem[] = [
    {
        id: "1",
        title: "Number 1",
        subtitle: "The Solar Pulse",
        description: "The number of the Monad, the Sun, and high-frequency initiation. 1 represents the raw 'I Am' presence, leadership, and the spark of creation. It resonates with the Solar Plexus and the sign of Leo.",
        keywords: ["Independence", "Innovation", "Ego", "Willpower"]
    },
    {
        id: "2",
        title: "Number 2",
        subtitle: "The Lunar Echo",
        description: "The number of duality, the Moon, and balance. 2 represents the receptive principle, intuition, and collaboration. It is the frequency of the diplomat and the sensitive. It resonates with Cancer.",
        keywords: ["Balance", "Sensitivity", "Partnership", "Intuition"]
    },
    {
        id: "3",
        title: "Number 3",
        subtitle: "The Jovian Expansion",
        description: "The number of expression, Jupiter, and synthesis. 3 represents the child, creativity, and the joy of existence. It is the vibration of the artist and the communicator. It resonates with Sagittarius and Pisces.",
        keywords: ["Creativity", "Optimism", "Socialization", "Growth"]
    },
    {
        id: "4",
        title: "Number 4",
        subtitle: "The Uranian Foundation",
        description: "The number of stability, Uranus (traditionally Saturn), and the square. 4 represents the builder, discipline, and hard work. It is the frequency of order and pragmatism. It resonates with Aquarius and Capricorn.",
        keywords: ["Structure", "Discipline", "Reliability", "Logic"]
    },
    {
        id: "5",
        title: "Number 5",
        subtitle: "The Mercurial Shift",
        description: "The number of change, Mercury, and freedom. 5 represents the adventurer, adaptability, and the five senses. It is the frequency of the catalyst and the traveler. It resonates with Gemini and Virgo.",
        keywords: ["Change", "Freedom", "Versatility", "Curiosity"]
    },
    {
        id: "6",
        title: "Number 6",
        subtitle: "The Venusian Harmony",
        description: "The number of responsibility, Venus, and nurturing. 6 represents the lover, the parent, and service to the community. It is the vibration of harmony and aesthetics. It resonates with Taurus and Libra.",
        keywords: ["Nurturing", "Service", "Harmony", "Responsibility"]
    },
    {
        id: "7",
        title: "Number 7",
        subtitle: "The Neptunian Mystery",
        description: "The number of spirituality, Neptune (traditionally Moon), and analysis. 7 represents the seeker, the mystic, and the quiet mind. It is the frequency of internal truth and psychic depth. It resonates with Pisces and Scorpio.",
        keywords: ["Mysticism", "Solitude", "Analysis", "Trust"]
    },
    {
        id: "8",
        title: "Number 8",
        subtitle: "The Saturnian Engine",
        description: "The number of power, Saturn, and karmic harvest. 8 represents the executive, authority, and material success. It is the frequency of the abundance cycle and the judge. It resonates with Capricorn and Aquarius.",
        keywords: ["Power", "Authority", "Wealth", "Control"]
    },
    {
        id: "9",
        title: "Number 9",
        subtitle: "The Mars Release",
        description: "The number of completion, Mars (traditionally Jupiter/Saturn limit), and compassion. 9 represents the humanitarian, the sage, and the end of a cycle. It is the vibration of universal love and surrender. It resonates with Aries and Scorpio.",
        keywords: ["Humanitarianism", "Wisdom", "Termination", "Altruism"]
    },
    {
        id: "11",
        title: "Number 11",
        subtitle: "The Master Messenger",
        description: "The first Master Number. A higher octave of 2. It represents illumination, channelled wisdom, and intense intuition. It is the brilliant light that pierces the veil, allowing higher truths to flow into the material world.",
        keywords: ["Intuition", "Illumination", "Sensitivity", "Idealism"]
    },
    {
        id: "22",
        title: "Number 22",
        subtitle: "The Master Architect",
        description: "The second Master Number. A higher octave of 4. It represents the ability to manifest high-level spiritual concepts into concrete, global reality.",
        keywords: ["Manifestation", "Pragmatism", "Large-scale", "Leadership"]
    },
    {
        id: "33",
        title: "Number 33",
        subtitle: "The Master Teacher",
        description: "The third Master Number. A higher octave of 6. It represents selfless service and the healing of the world through unconditional love and spiritual wisdom.",
        keywords: ["Altruism", "Healing", "Service", "Compassion"]
    }
];

export const STAR_KNOWLEDGE: KnowledgeItem[] = [
    {
        id: "Regulus",
        title: "Regulus",
        subtitle: "The Royal Signal",
        icon: "✨",
        description: "The Heart of the Lion. One of the four Royal Stars of Persia. It represents power, success, and the ability to command. In the Athanor's view, Regulus is the sovereign spark with the highest spiritual authority.",
        keywords: ["Authority", "Ambition", "Success", "Command"]
    },
    {
        id: "Algol",
        title: "Algol",
        subtitle: "The Demon Head",
        icon: "💀",
        description: "The Gorgon's eye. Known as the most malevolent star, but in truth, it represents raw, unbridled power that can be destructive if not grounded. It is the overwhelming flood of force—terrifying, but revealing of the soul's greatest potential and limits.",
        keywords: ["Intensity", "Power", "Destruction", "Primal Force"]
    },
    {
        id: "Sirius",
        title: "Sirius",
        subtitle: "The Scorcher",
        icon: "🌟",
        description: "The brightest star in the night sky. Traditionally associated with extreme heat and intensity. It represents spiritual activation and the 'higher' Sun. It is the brilliant bridge of fire connecting the soul to the divine mind.",
        keywords: ["Brilliance", "Intensity", "Fame", "Spiritual Activation"]
    },
    {
        id: "Spica",
        title: "Spica",
        subtitle: "The Ear of Wheat",
        icon: "🌾",
        description: "A star of pure benevolence and talent. It represents the harvest of one's efforts and the gift of grace. It is the perfectly ripened fruit of the spirit—flawless and blessed.",
        keywords: ["Grace", "Talent", "Success", "Abundance"]
    }
];

export const MANSION_KNOWLEDGE: KnowledgeItem[] = [
    {
        id: "1",
        title: "Al-Sharatain",
        subtitle: "The Two Signals",
        description: "The first lunar mansion. Marking the beginning of the lunar cycle. It represents the impulse to act and the initial handshake of a protocol.",
        keywords: ["Beginning", "Energy", "Impulse"]
    },
    {
        id: "2",
        title: "Al-Butain",
        subtitle: "The Hidden Core",
        description: "The second mansion. Focused on internal growth and the processing of raw data before it manifests.",
        keywords: ["Incubation", "Internalization", "Formulation"]
    },
    {
        id: "3",
        title: "Al-Thurayya",
        subtitle: "The Pleiades Cluster",
        description: "The third mansion. A cluster of stars representing community, beauty, and the distributed network of collective consciousness.",
        keywords: ["Community", "Harmony", "Aesthetics"]
    }
];
