import { NatalChartData, PlanetPosition } from '@/types/astrology';
import { getZodiacInfo } from '@/utils/astrologyUtils';
// @ts-ignore
import SwissEphWrapper from 'swisseph-wasm';
// @ts-ignore
import RawFactory from './wasm/swisseph-factory-v2.js';

// Paths to the WASM and Data files (placed in public folder)
const SWISS_EPH_WASM_PATH = '/wasm/swisseph.wasm';
const SWISS_EPH_DATA_PATH = '/wasm/swisseph.data';

const SE_SUN = 0;
const SE_MOON = 1;
const SE_MERCURY = 2;
const SE_VENUS = 3;
const SE_MARS = 4;
const SE_JUPITER = 5;
const SE_SATURN = 6;
const SE_URANUS = 7;
const SE_NEPTUNE = 8;
const SE_PLUTO = 9;
const SE_MEAN_NODE = 10;

const PLANET_MAP: Record<string, number> = {
  'Sun': SE_SUN,
  'Moon': SE_MOON,
  'Mercury': SE_MERCURY,
  'Venus': SE_VENUS,
  'Mars': SE_MARS,
  'Jupiter': SE_JUPITER,
  'Saturn': SE_SATURN,
  'Uranus': SE_URANUS,
  'Neptune': SE_NEPTUNE,
  'Pluto': SE_PLUTO,
  'North Node': SE_MEAN_NODE
};

interface SwissEphInstance {
  julday: (year: number, month: number, day: number, hour: number, gregflag: number) => number;
  calc_ut: (jd: number, planet: number, flags: number) => Float64Array;
  houses: (jd: number, lat: number, lng: number, hsys: string) => { house: number[]; ascmc: number[] }; 
  initSwissEph: () => Promise<void>;
  swe_close: () => void;
  close: () => void;
  SweModule: any;
  set_ephe_path: (path: string) => void;
}

let swissEph: SwissEphInstance | null = null;
let initializationPromise: Promise<void> | null = null;
let initializationFailed = false;

export class SwissEphemerisService {
  static async initialize(): Promise<void> {
    if (swissEph) return;
    if (initializationPromise) return initializationPromise;

    initializationPromise = (async () => {
      try {
        console.log("🌟 [SwissEph] Initializing...");
        
        const [wasmResponse, dataResponse] = await Promise.all([
            fetch(SWISS_EPH_WASM_PATH),
            fetch(SWISS_EPH_DATA_PATH)
        ]);

        if (!wasmResponse.ok || !dataResponse.ok) {
            throw new Error(`Failed to fetch WASM/Data assets`);
        }

        const wasmBinary = await wasmResponse.arrayBuffer();
        const dataBinary = await dataResponse.arrayBuffer();

        const config: any = {
            wasmBinary: wasmBinary,
            ALLOW_MEMORY_GROWTH: 1,
            INITIAL_MEMORY: 268435456, // 256MB
            getPreloadedPackage: () => dataBinary,
            locateFile: (path: string) => {
                 if (path.endsWith('.wasm')) return SWISS_EPH_WASM_PATH;
                 if (path.endsWith('.data')) return SWISS_EPH_DATA_PATH;
                 return path;
            },
            instantiateWasm: (imports: any, successCallback: Function) => {
                WebAssembly.instantiate(wasmBinary, imports).then(output => {
                    successCallback(output.instance);
                });
                return {}; 
            }
        };

        const moduleInstance = await RawFactory(config);
        const wrapper = new SwissEphWrapper();
        (wrapper as any).SweModule = moduleInstance;

        if (typeof (wrapper as any).set_ephe_path === 'function') {
            (wrapper as any).set_ephe_path('/sweph');
        }

        swissEph = wrapper as unknown as SwissEphInstance;

        // --- MONKEY PATCHES ---
        (swissEph as any).calc_ut = function(jd: number, planet: number, flags: number) {
            const resultPtr = this.SweModule._malloc(48);
            const errPtr = this.SweModule._malloc(256);
            try {
                this.SweModule.ccall('swe_calc_ut', 'number', 
                    ['number', 'number', 'number', 'number', 'number'], 
                    [jd, planet, flags, resultPtr, errPtr]
                );
                const F64 = this.SweModule.HEAPF64;
                const idx = resultPtr >> 3; 
                const output = new Float64Array(6);
                for(let i=0; i<6; i++) output[i] = F64[idx + i];
                return output;
            } finally {
                this.SweModule._free(resultPtr);
                this.SweModule._free(errPtr);
            }
        };

        (swissEph as any).houses = function(jd: number, lat: number, lng: number, hsys: string | number) {
            const hsysInt = typeof hsys === 'string' ? hsys.charCodeAt(0) : hsys;
            const cuspsPtr = this.SweModule._malloc(13 * 8);
            const ascmcPtr = this.SweModule._malloc(10 * 8);
            try {
                this.SweModule.ccall('swe_houses', 'number',
                    ['number', 'number', 'number', 'number', 'number', 'number'],
                    [jd, lat, lng, hsysInt, cuspsPtr, ascmcPtr]
                );
                const F64 = this.SweModule.HEAPF64;
                const houseCusps = [];
                for(let i=1; i<=12; i++) houseCusps.push(F64[(cuspsPtr >> 3) + i]);
                const ascmc = [];
                for(let i=0; i<10; i++) ascmc.push(F64[(ascmcPtr >> 3) + i]);
                return { house: houseCusps, ascmc };
            } finally {
                this.SweModule._free(cuspsPtr);
                this.SweModule._free(ascmcPtr);
            }
        };

        console.log("✅ [SwissEph] Initialization complete. (Patched for NASA Accuracy)");
      } catch (error) {
        console.error("❌ [SwissEph] Initialization Failed:", error);
        initializationFailed = true;
      }
    })();

    return initializationPromise;
  }

  static isAvailable(): boolean {
    return swissEph !== null && !initializationFailed;
  }

  static async calculateChart(date: Date, lat: number, lng: number): Promise<NatalChartData> {
    if (!swissEph) await this.initialize();
    if (!swissEph) throw new Error("SwissEph failed to initialize");

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

    const jd = swissEph.julday(year, month, day, hour, 1);
    const planets: PlanetPosition[] = [];

    const SEFLG_SWIEPH = 2;
    const SEFLG_SPEED = 256;

    for (const [name, id] of Object.entries(PLANET_MAP)) {
      const data = swissEph.calc_ut(jd, id, SEFLG_SWIEPH | SEFLG_SPEED);
      planets.push({
        name,
        ...getZodiacInfo(data[0]),
        absoluteDegree: data[0],
        retrograde: data[3] < 0
      });
    }

    const { house: houseCusps } = swissEph.houses(jd, lat, lng, 'P');
    
    // Assign planets to houses
    planets.forEach(p => {
        for (let i = 0; i < 12; i++) {
            const start = houseCusps[i];
            const end = i === 11 ? houseCusps[0] : houseCusps[i + 1];
            let diff = end - start;
            if (diff < 0) diff += 360;
            let pDiff = p.absoluteDegree - start;
            if (pDiff < 0) pDiff += 360;
            if (pDiff < diff) {
                p.house = i + 1;
                break;
            }
        }
    });

    return {
      date: date.toISOString(),
      planets,
      houses: houseCusps.map((cusp, i) => ({
          house: i+1,
          ...getZodiacInfo(cusp),
          absoluteDegree: cusp
      })),
      ascendant: {
          ...getZodiacInfo(houseCusps[0]),
          absoluteDegree: houseCusps[0]
      }
    };
  }
}
