
import { ComponentTypeData, ComponentStatus, Ingredient, ChangeType, Version, KnobMeta, KnobOption, WorkflowStep } from './types';

const generateVersions = (base: string, count: number, startVersion: number): Version[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `v-${base}-${i}`,
    versionString: `2025.12.4.${startVersion - i}`,
    releaseDate: `11/${24 + (count - i)}/2025`,
    releasedBy: 'Nagorski, Wojciech',
    isNewer: i < 2
  }));
};

export const MOCK_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-ec-prod',
    name: 'PTL_EC_Release_Prod_EC_0',
    projectFeed: 'PTL-IFWI/Default',
    siliconFamily: 'Panther Lake',
    releaseCount: 15,
    versions: [
      {
        id: 'v-custom-history-1',
        versionString: '2025.12.4.999-custom',
        releaseDate: '11/30/2025',
        releasedBy: 'User Upload',
        isNewer: true,
        description: 'Previous custom build for testing power states.'
      },
      ...generateVersions('ec-prod', 10, 504)
    ]
  },
  {
    id: 'ing-bios-std',
    name: 'PTL_BIOS_Release_Prod_BIOS_Main',
    projectFeed: 'PTL-IFWI/Default',
    siliconFamily: 'Panther Lake',
    releaseCount: 42,
    versions: generateVersions('bios', 12, 504)
  },
  {
    id: 'ing-civil',
    name: 'PTL_CIVIL_Release_Prod_CIVIL_0',
    projectFeed: 'PTL-IFWI/Default',
    siliconFamily: 'Panther Lake',
    releaseCount: 55,
    versions: generateVersions('civil', 15, 600)
  },
  {
    id: 'ing-gse',
    name: 'PTL_GSE_Release_Prod_GSE_0',
    projectFeed: 'PTL-IFWI/Default',
    siliconFamily: 'Panther Lake',
    releaseCount: 8,
    versions: generateVersions('gse', 5, 504)
  },
  {
    id: 'ing-ish',
    name: 'PTL_ISH_Release_Prod_ISH_0',
    projectFeed: 'PTL-IFWI/Default',
    siliconFamily: 'Panther Lake',
    releaseCount: 12,
    versions: generateVersions('ish', 8, 504)
  },
  {
    id: 'ing-nphy',
    name: 'PTL_NPHY_Release_Prod_NPHY_0',
    projectFeed: 'PTL-IFWI/Default',
    siliconFamily: 'Panther Lake',
    releaseCount: 4,
    versions: generateVersions('nphy', 4, 504)
  },
  {
    id: 'ing-sphy',
    name: 'PTL_SPHY_Release_Prod_SPHY_0',
    projectFeed: 'PTL-IFWI/Default',
    siliconFamily: 'Panther Lake',
    releaseCount: 6,
    versions: generateVersions('sphy', 6, 504)
  }
];

export const INITIAL_TYPES: ComponentTypeData[] = [
  {
    id: 'type-ec',
    label: 'EC',
    category: 'KEY_INGREDIENTS',
    status: ComponentStatus.CONFIGURED,
    source: 'Baseline',
    currentIngredientId: 'ing-ec-prod',
    currentVersionId: 'v-ec-prod-0', 
    stagedIngredientId: 'ing-ec-prod',
    stagedVersionId: 'v-ec-prod-0',
    originalIngredientId: 'ing-ec-prod',
    originalVersionId: 'v-ec-prod-0',
    changeType: ChangeType.NONE,
    isPinned: true,
    order: 0
  },
  {
    id: 'type-pse',
    label: 'PSE',
    category: 'KEY_INGREDIENTS',
    status: ComponentStatus.NOT_CONFIGURED,
    source: 'Baseline',
    currentIngredientId: null,
    currentVersionId: null,
    stagedIngredientId: null,
    stagedVersionId: null,
    originalIngredientId: null,
    originalVersionId: null,
    changeType: ChangeType.NONE,
    isPinned: true,
    order: 1
  },
  {
    id: 'type-bios',
    label: 'BIOS',
    category: 'KEY_INGREDIENTS',
    status: ComponentStatus.CONFIGURED,
    source: 'Baseline',
    currentIngredientId: 'ing-bios-std',
    currentVersionId: 'v-bios-0',
    stagedIngredientId: 'ing-bios-std',
    stagedVersionId: 'v-bios-0',
    originalIngredientId: 'ing-bios-std',
    originalVersionId: 'v-bios-0',
    changeType: ChangeType.NONE,
    isPinned: true,
    order: 2
  },
  {
    id: 'type-civil',
    label: 'CIVIL',
    category: 'STANDARD',
    status: ComponentStatus.CONFIGURED,
    source: 'Baseline',
    currentIngredientId: 'ing-civil',
    currentVersionId: 'v-civil-9', 
    stagedIngredientId: 'ing-civil',
    stagedVersionId: 'v-civil-9',
    originalIngredientId: 'ing-civil',
    originalVersionId: 'v-civil-9',
    changeType: ChangeType.NONE,
    isPinned: false,
    order: 3
  },
  {
    id: 'type-gse',
    label: 'GSE',
    category: 'STANDARD',
    status: ComponentStatus.NOT_CONFIGURED,
    source: 'Baseline',
    currentIngredientId: null,
    currentVersionId: null,
    stagedIngredientId: null,
    stagedVersionId: null,
    originalIngredientId: null,
    originalVersionId: null,
    changeType: ChangeType.NONE,
    isPinned: false,
    order: 4
  },
  {
    id: 'type-ish',
    label: 'ISH',
    category: 'STANDARD',
    status: ComponentStatus.CONFIGURED,
    source: 'Baseline',
    currentIngredientId: 'ing-ish',
    currentVersionId: 'v-ish-0',
    stagedIngredientId: 'ing-ish',
    stagedVersionId: 'v-ish-0',
    originalIngredientId: 'ing-ish',
    originalVersionId: 'v-ish-0',
    changeType: ChangeType.NONE,
    isPinned: false,
    order: 5
  },
  {
    id: 'type-nphy',
    label: 'NPHY',
    category: 'STANDARD',
    status: ComponentStatus.CONFIGURED,
    source: 'Baseline',
    currentIngredientId: 'ing-nphy',
    currentVersionId: 'v-nphy-0',
    stagedIngredientId: 'ing-nphy',
    stagedVersionId: 'v-nphy-0',
    originalIngredientId: 'ing-nphy',
    originalVersionId: 'v-nphy-0',
    changeType: ChangeType.NONE,
    isPinned: false,
    order: 6
  },
  {
    id: 'type-sphy',
    label: 'SPHY',
    category: 'STANDARD',
    status: ComponentStatus.CONFIGURED,
    source: 'Baseline',
    currentIngredientId: 'ing-sphy',
    currentVersionId: 'v-sphy-0',
    stagedIngredientId: 'ing-sphy',
    stagedVersionId: 'v-sphy-0',
    originalIngredientId: 'ing-sphy',
    originalVersionId: 'v-sphy-0',
    changeType: ChangeType.NONE,
    isPinned: false,
    order: 7
  },
  {
    id: 'type-csme',
    label: 'CSME',
    category: 'LOCKED',
    status: ComponentStatus.LOCKED,
    source: 'Baseline',
    currentIngredientId: null,
    currentVersionId: null,
    stagedIngredientId: null,
    stagedVersionId: null,
    originalIngredientId: null,
    originalVersionId: null,
    changeType: ChangeType.NONE,
    isPinned: false,
    order: 8
  },
  {
    id: 'type-pmc',
    label: 'PMC',
    category: 'LOCKED',
    status: ComponentStatus.LOCKED,
    source: 'Baseline',
    currentIngredientId: null,
    currentVersionId: null,
    stagedIngredientId: null,
    stagedVersionId: null,
    originalIngredientId: null,
    originalVersionId: null,
    changeType: ChangeType.NONE,
    isPinned: false,
    order: 9
  }
];

export const MOCK_STEPS: WorkflowStep[] = [
  { id: 'build-0', label: 'IFWI Build 0', stage: 'Build', status: 'Not started' },
  { id: 'build-1', label: 'IFWI Build 1', stage: 'Build', status: 'Not started' },
  { id: 'build-2', label: 'IFWI Build 2', stage: 'Build', status: 'Not started' },
  { id: 'bios-build-1', label: 'BIOS Build 1', stage: 'Build', status: 'Not started' },
  { id: 'test-0', label: 'PV Validation', stage: 'Test', status: 'Not started' },
  { id: 'test-1', label: 'Security Scan', stage: 'Test', status: 'Not started' },
  { id: 'deploy-0', label: 'Production Push', stage: 'Deploy', status: 'Not started' },
];

// --- KNOB DATA GENERATION ---

// Standard options re-used across knobs
const OPT_ENABLE_DISABLE: KnobOption[] = [
  { text: "Disabled", value: "0x0" },
  { text: "Enabled",  value: "0x1" }
];

const OPT_ENABLE_DISABLE_AUTO: KnobOption[] = [
  { text: "Disabled", value: "0x0" },
  { text: "Enabled",  value: "0x1" },
  { text: "Auto",     value: "0x2" }
];

const OPT_GEN_SPEED: KnobOption[] = [
  { text: "Auto", value: "0x0" },
  { text: "Gen1", value: "0x1" },
  { text: "Gen2", value: "0x2" },
  { text: "Gen3", value: "0x3" },
  { text: "Gen4", value: "0x4" },
  { text: "Gen5", value: "0x5" }
];

const STATIC_KNOBS: KnobMeta[] = [
  {
    knobName: "RMTLoopCount",
    type: "numeric",
    prompt: "Loop Count",
    description: "Exponential loop count for single rank test",
    categoryPath: "Socket Configuration/Memory Configuration/RMT Configuration Menu/Loop Count",
    dependencies: "Sif( SsaBuiltInRmtKnobVisible _EQU_ 0 ) _AND_ Sif( _LIST_ EnableRMT _EQU_ 0 )",
    defaultValue: "0x10",
    currentValue: "0x10",
    size: "1",
    offset: "0x015A",
    varstoreIndex: "01",
    varstoreName: "SocketMemoryConfig",
    min: "0x0",
    max: "0x1F",
    step: "0",
    options: null
  },
  {
    knobName: "TxRiseFallSlewRate",
    type: "oneof",
    prompt: "TX Rise Fall Slew Rate Training",
    description: "Enable/Disable TX Rise Fall Slew Rate Training. Auto = dynamically selected. Enable or Disable will control TXRFSR regardless of frequency",
    categoryPath: "Socket Configuration/Memory Configuration/Memory Training/TX Rise Fall Slew Rate Training",
    dependencies: "TRUE",
    defaultValue: "0x2",
    currentValue: "0x2",
    size: "1",
    offset: "0x0041",
    varstoreIndex: "01",
    varstoreName: "SocketMemoryConfig",
    min: null,
    max: null,
    step: null,
    options: OPT_ENABLE_DISABLE_AUTO
  },
  {
    knobName: "DutyCycleTraining",
    type: "oneof",
    prompt: "Duty Cycle Training",
    description: "Enable/Disable Duty Cycle Training",
    categoryPath: "Socket Configuration/Memory Configuration/Memory Training/Duty Cycle Training",
    dependencies: "TRUE",
    defaultValue: "0x1",
    currentValue: "0x1",
    size: "1",
    offset: "0x0042",
    varstoreIndex: "01",
    varstoreName: "SocketMemoryConfig",
    min: null,
    max: null,
    step: null,
    options: OPT_ENABLE_DISABLE
  },
  {
    knobName: "DfxDcsDfeTap3Coefficient",
    type: "numeric",
    prompt: "DCS DFE Tap 3 Coefficient",
    description: "Select the DCS DFE Tap 3 coefficient (0-15)",
    categoryPath: "Socket Configuration/Memory Configuration/Memory Dfx Configuration/DCS DFE Tap 3 Coefficient",
    dependencies: "TRUE",
    defaultValue: "0x0",
    currentValue: "0x0",
    size: "1",
    offset: "0x003E",
    varstoreIndex: "01",
    varstoreName: "SocketMemoryConfig",
    min: "0x0",
    max: "0xF",
    step: "0",
    options: null
  },
  {
    knobName: "DfxDramRttWrDimm0",
    type: "oneof",
    prompt: "DRAM RTT WR Dimm 0 Setting",
    description: "DRAM RTT WR Dimm 0 value. Valid range is 0-7.",
    categoryPath: "Socket Configuration/Memory Configuration/Memory Dfx Configuration/DRAM RTT WR Dimm 0 Setting",
    dependencies: "Sif( ( DfxRttOverrideEn _NEQ_ 1 ) )",
    defaultValue: "0xFF",
    currentValue: "0xFF",
    size: "1",
    offset: "0x0221",
    varstoreIndex: "01",
    varstoreName: "SocketMemoryConfig",
    min: null,
    max: null,
    step: null,
    options: [
      { text: "Auto",       value: "0xFF" },
      { text: "RTT_OFF",    value: "0x0" },
      { text: "RZQ (240)",  value: "0x1" },
      { text: "RZQ/2 (120)",value: "0x2" },
      { text: "RZQ/3 (80)", value: "0x3" },
      { text: "RZQ/4 (60)", value: "0x4" },
      { text: "RZQ/5 (48)", value: "0x5" },
      { text: "RZQ/6 (40)", value: "0x6" },
      { text: "RZQ/7 (34)", value: "0x7" }
    ]
  },
  {
    knobName: "DfxDcsRxDfeGainCoefficient",
    type: "oneof",
    prompt: "DCS RX DFE Gain Coefficient",
    description: "Valid values: 0-7",
    categoryPath: "Socket Configuration/Memory Configuration/Memory Dfx Configuration/DCS RX DFE Gain Coefficient",
    dependencies: "TRUE",
    defaultValue: "0xFF",
    currentValue: "0xFF",
    size: "1",
    offset: "0x02BB",
    varstoreIndex: "01",
    varstoreName: "SocketMemoryConfig",
    min: null,
    max: null,
    step: null,
    options: [
      { text: "Disabled", value: "0xFF" },
      { text: "0:  0 dB", value: "0x0" },
      { text: "1: +6 dB", value: "0x1" },
      { text: "2: +4 dB", value: "0x2" },
      { text: "3: +2 dB", value: "0x3" },
      { text: "4:  0 dB", value: "0x4" },
      { text: "5: -2 dB", value: "0x5" },
      { text: "6: -4 dB", value: "0x6" },
      { text: "7: -6 dB", value: "0x7" }
    ]
  },
  {
    knobName: "PchPcieRootPortMaxPayloadSizeSupportedExceedinglyLongNameLimit70Chars",
    type: "oneof",
    prompt: "PCH PCIe Root Port Max Payload Size Supported (Stress Test)",
    description: "This knob is explicitly created to test the UI's ability to handle extremely long names (70 chars) and path depths (160 chars) without breaking the layout.",
    categoryPath: "Socket Configuration/PCH Configuration/PCI Express/Root Port Configuration/Advanced Error Reporting/Capability Settings/Deeply Nested Submenu/Testing Layout Limits/Category Path Exceeding One Hundred Sixty Characters",
    dependencies: "TRUE",
    defaultValue: "0x0",
    currentValue: "0x0",
    size: "1",
    offset: "0xFFFF",
    varstoreIndex: "01",
    varstoreName: "StressTestConfig",
    min: null, max: null, step: null,
    options: [
      { text: "128 Bytes", value: "0x0" },
      { text: "256 Bytes", value: "0x1" }
    ]
  }
];

// Algorithmically generate ~1000 knobs for performance testing
const generateLargeMockKnobDataset = (): KnobMeta[] => {
  const generated: KnobMeta[] = [];
  
  for (let i = 0; i < 32; i++) {
    generated.push({
      knobName: `PcieRootPort${i}Aspm`,
      type: 'oneof',
      prompt: `Root Port ${i} ASPM`,
      description: `Control Active State Power Management for PCIe Root Port ${i}`,
      categoryPath: `Socket Configuration/PCH Configuration/PCI Express/Root Port ${i}`,
      dependencies: "TRUE",
      defaultValue: "0x2",
      currentValue: "0x2",
      size: "1",
      offset: `0x1${i.toString(16).padStart(3, '0')}`,
      varstoreIndex: "02",
      varstoreName: "PchConfig",
      min: null, max: null, step: null,
      options: OPT_ENABLE_DISABLE_AUTO
    });
    generated.push({
      knobName: `PcieRootPort${i}L1Substates`,
      type: 'oneof',
      prompt: `Root Port ${i} L1 Substates`,
      description: `L1.1 / L1.2 Substate control`,
      categoryPath: `Socket Configuration/PCH Configuration/PCI Express/Root Port ${i}`,
      dependencies: "TRUE",
      defaultValue: "0x3",
      currentValue: "0x3",
      size: "1",
      offset: `0x1${(i+100).toString(16).padStart(3, '0')}`,
      varstoreIndex: "02",
      varstoreName: "PchConfig",
      min: null, max: null, step: null,
      options: [
        { text: "Disabled", value: "0x0" },
        { text: "L1.1", value: "0x1" },
        { text: "L1.2", value: "0x2" },
        { text: "L1.1 & L1.2", value: "0x3" }
      ]
    });
    generated.push({
      knobName: `PcieRootPort${i}Speed`,
      type: 'oneof',
      prompt: `Root Port ${i} Speed`,
      description: `Max Link Speed for RP ${i}`,
      categoryPath: `Socket Configuration/PCH Configuration/PCI Express/Root Port ${i}`,
      dependencies: "TRUE",
      defaultValue: "0x0",
      currentValue: "0x0",
      size: "1",
      offset: `0x2${i.toString(16).padStart(3, '0')}`,
      varstoreIndex: "02",
      varstoreName: "PchConfig",
      min: null, max: null, step: null,
      options: OPT_GEN_SPEED
    });
  }

  for (let i = 0; i < 16; i++) {
    generated.push({
      knobName: `PchUsbPort${i}Enable`,
      type: 'checkbox',
      prompt: `USB Port ${i} Disable`,
      description: `Selectively enable/disable USB Port ${i}`,
      categoryPath: `Socket Configuration/PCH Configuration/USB Configuration`,
      dependencies: "TRUE",
      defaultValue: "0x1",
      currentValue: "0x1",
      size: "1",
      offset: `0x3${i.toString(16).padStart(3, '0')}`,
      varstoreIndex: "02",
      varstoreName: "PchConfig",
      min: null, max: null, step: null,
      options: null
    });
  }

  for (let i = 0; i < 8; i++) {
    generated.push({
      knobName: `SataPort${i}HotPlug`,
      type: 'oneof',
      prompt: `SATA Port ${i} Hot Plug`,
      description: `Enable/Disable Hot Plug support`,
      categoryPath: `Socket Configuration/PCH Configuration/SATA Configuration`,
      dependencies: "TRUE",
      defaultValue: "0x0",
      currentValue: "0x0",
      size: "1",
      offset: `0x4${i.toString(16).padStart(3, '0')}`,
      varstoreIndex: "02",
      varstoreName: "PchConfig",
      min: null, max: null, step: null,
      options: OPT_ENABLE_DISABLE
    });
  }

  const memChannels = 4;
  ['CasLatency', 'Rcd', 'Rp', 'Ras', 'Rrd', 'Rfc', 'Wtr', 'Rtp', 'Faw'].forEach((timing, tIdx) => {
    for (let ch = 0; ch < memChannels; ch++) {
      generated.push({
        knobName: `MemCh${ch}${timing}`,
        type: 'numeric',
        prompt: `Channel ${ch} ${timing}`,
        description: `Override ${timing} for Channel ${ch}. 0 = Auto.`,
        categoryPath: `Socket Configuration/Memory Configuration/Memory Timings`,
        dependencies: "TRUE",
        defaultValue: "0x0",
        currentValue: "0x0",
        size: "1",
        offset: `0x5${ch}${tIdx}`,
        varstoreIndex: "01",
        varstoreName: "SocketMemoryConfig",
        min: "0x0", max: "0xFF", step: "1",
        options: null
      });
    }
  });

  for (let i = 0; i < 400; i++) {
    generated.push({
      knobName: `DfxGenericFeature${i}`,
      type: 'oneof',
      prompt: `DFX Feature ${i} Control`,
      description: `Debug feature control for internal validation #${i}`,
      categoryPath: `Advanced/Debug Settings/Generic DFX`,
      dependencies: "TRUE",
      defaultValue: "0x0",
      currentValue: "0x0",
      size: "1",
      offset: `0x6${i.toString(16).padStart(3, '0')}`,
      varstoreIndex: "03",
      varstoreName: "DfxConfig",
      min: null, max: null, step: null,
      options: [
        { text: "Default", value: "0x0" },
        { text: "Debug Mode 1", value: "0x1" },
        { text: "Debug Mode 2", value: "0x2" }
      ]
    });
  }
  
  for (let core = 0; core < 16; core++) {
     generated.push({
        knobName: `CpuCore${core}Limit`,
        type: 'numeric',
        prompt: `Core ${core} Ratio Limit`,
        description: `Max ratio for core ${core}`,
        categoryPath: `Socket Configuration/Processor Configuration/Power Management`,
        dependencies: "TRUE",
        defaultValue: "0x32",
        currentValue: "0x32",
        size: "1",
        offset: `0x7${core.toString(16).padStart(3, '0')}`,
        varstoreIndex: "04",
        varstoreName: "CpuConfig",
        min: "0x0", max: "0x50", step: "1",
        options: null
     });
  }

  return generated;
};

export const MOCK_KNOB_METADATA: KnobMeta[] = [
  ...STATIC_KNOBS,
  ...generateLargeMockKnobDataset()
];

// Scenario Simulation Data
export const MOCK_BASELINE_OVERRIDES: Record<string, string> = {
  "RMTLoopCount": "0x18",
  "TxRiseFallSlewRate": "0x1",
  "DutyCycleTraining": "0x0",
  "PcieRootPort0Aspm": "0x1",
  "PcieRootPort0Speed": "0x3",
  "MemCh0CasLatency": "0x1E",
  "CpuCore0Limit": "0x40"
};
