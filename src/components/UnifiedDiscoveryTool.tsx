import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Download, CheckCircle, AlertCircle, FileJson, Info, Plus, Trash2, Calendar, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateDiscoveryPDF, generateDiscoveryJSON, calculateScores, type DiscoveryFormData, type DiscoveryScores } from '@/utils/discoveryExport';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/PBC-Logo.svg';
import { BrandShaderGradient } from '@/components/effects/BrandShaderGradient';

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const INITIAL_FORM: DiscoveryFormData = {
  institutionName: '', institutionType: '', totalAssets: '', countriesOfOperation: 0,
  regions: [], isGlobal: false, bankingRelationships: [], otherBankingRelationships: '',
  monthlyVolume: 0, annualGrowthRate: 0, crossBorderPercent: 0,
  corridors: [{ currencyPair: '', monthlyVolume: 0 }],
  currencyCount: 0, messageDistribution: { mt103: 0, mt202: 0, mt900: 0, mt910: 0, other: 0 }, reconciliationComplexity: '',
  coreSystem: '', systemAge: '', swiftConnectivity: '', messagingFormats: [],
  isoSendCapable: '', isoReceiveCapable: '', extendedFieldsCapable: '',
  integrationComplexity: '', itTeamSize: '', blockchainExperience: false,
  dltStrategyMaturity: '', november2026Priority: '',
  enhancedDataMandateReadiness: '', primaryComplianceMotivation: '',
  complianceBudget: '', urgency: '', targetGoLive: '', translationFeeTolerance: '', vendorSelectionStatus: '',
  nostroRelationshipCount: '', nostroBalanceRange: '', costOfCapital: '',
  monthlyPaymentRepairVolume: '', truncationRejections: '', capitalTreatmentAwareness: '', digitalAssetExposure: '',
  institutionClassification: '', geographicFootprint: '', primaryCorridorRegions: [],
  boardAwarenessLevel: '', peerBenchmarkConsent: false,
  swiftTranslationOptInStatus: '', structuredAddressReadiness: '',
  lastSwiftStandardsReview: '', strategicAmbition: '', reportTypeRequested: '',
  executiveSponsorship: '', dedicatedPM: '', changeManagement: '', testingEnvironment: '',
  rollbackCapability: '', staffTraining: '',
};

const REGIONS = ['Europe', 'Asia-Pacific', 'Americas', 'Middle East', 'Africa', 'Global (all regions)'];
const INSTITUTION_TYPES = ['Commercial Bank', 'Regional Bank', 'Credit Union', 'Payment Institution', 'Investment Bank', 'Central Bank', 'Other'];
const ASSET_SIZES = ['Under €1B', '€1B-€10B', '€10B-€50B', '€50B-€200B', 'Over €200B'];
const CORE_SYSTEMS = ['Temenos T24', 'Finastra Fusion', 'Oracle FLEXCUBE', 'SAP Banking', 'Murex', 'FIS', 'Fiserv', 'Proprietary/Custom', 'Other'];
const SYSTEM_AGES = ['Latest version', '1-2 years old', '3-5 years old', '5-10 years old', 'Over 10 years old'];
const SWIFT_OPTIONS = ['Alliance Access', 'Alliance Lite2', 'Service Bureau', 'Direct', 'None'];
const MSG_FORMATS = ['MT (legacy SWIFT)', 'ISO 20022 (MX)', 'Proprietary format', 'Multiple formats'];
const YES_NO_IP = ['Yes', 'No', 'In progress'];
const YES_NO_PARTIAL = ['Yes', 'No', 'Partial'];
const COMPLEXITY = ['Low', 'Medium', 'High', 'Very High'];
const TEAM_SIZES = ['0', '1-2', '3-5', '6-9', '10-25', '26+'];
const RECON_COMPLEXITY = ['Simple', 'Moderate', 'Complex', 'Very Complex'];
const BUDGETS = ['Under €100K', '€100K-€500K', '€500K-€1M', '€1M-€5M', 'Over €5M'];
const URGENCIES = ['Immediate (started)', 'Standard (6-12 months)', 'Planned (12-18 months)', 'Flexible (18+ months)'];
const FEE_TOLERANCE = ['Under €1,000', '€1,000-€5,000', '€5,000-€20,000', 'Over €20,000', 'Unknown'];
const VENDOR_STATUS = ['Not started', 'Evaluating options', 'Shortlisted vendors', 'Selected', 'Contracted'];
const SPONSORSHIP = ['No sponsorship', 'Awareness', 'Active support', 'Strong commitment', 'C-level champion', 'C-suite champion'];
const CHANGE_MGMT = ['None', 'Limited', 'Moderate', 'Strong'];
const TRAINING = ['Not started', 'Planned', 'In progress', 'Complete'];

const DLT_MATURITY = ['Not exploring', 'Monitoring developments', 'Exploring / Learning', 'Actively evaluating', 'Active pilot / POC', 'Production deployment'];
const NOV_2026_PRIORITY = ['Critical priority', 'Active planning', 'On our radar', 'Not yet planned', 'Compliant'];
const NOSTRO_COUNTS = ['1-5', '6-15', '16-30', '30+'];
const NOSTRO_BALANCES = ['Under €1M', '€1M-€10M', '€10M-€50M', '€50M-€200M', '€200M+', 'Prefer to discuss'];
const COST_OF_CAPITAL = ['Below 3%', '3-5%', '5-8%', 'Above 8%', 'Use standard assumption (3%)'];
const REPAIR_VOLUMES = ['None', 'Under 50', '50-200', '200-500', '500+'];
const TRUNCATION_OPTIONS = ['Yes, regularly', 'Occasionally', 'Rarely or never', 'Unknown'];
const CAPITAL_TREATMENT = ['Fully assessed', 'Partially assessed', 'Not yet assessed', 'Not applicable'];
const DIGITAL_ASSET_EXPOSURE = ['None', 'Monitoring only', 'Pilot or exploring', 'Operational'];
const INST_CLASSIFICATION = ['Commercial bank', 'Credit cooperative', 'Savings bank', 'Regional bank', 'Subsidiary of international group', 'Specialized institution'];
const GEO_FOOTPRINT = ['Domestic only', 'Eurozone', 'Europe broad', 'Global'];
const CORRIDOR_REGIONS = ['Eurozone', 'USD corridors', 'GBP corridors', 'CHF corridors', 'CNY corridors', 'Emerging markets', 'Other'];
const BOARD_AWARENESS = ['No awareness', 'Awareness', 'Partial awareness', 'Moderate awareness', 'Full awareness and active engagement'];
const SWIFT_OPT_IN = ['Opted in', 'Opted in — currently paying fees', 'Opted out (native ISO 20022)', 'Opted out — native ISO 20022', 'Unknown or not assessed'];
const ADDRESS_READINESS = ['Fully prepared', 'In progress', 'Planning phase', 'Not yet addressed'];
const SWIFT_REVIEW = ['SR2025 (current)', 'SR2024', 'Earlier', 'Not formally reviewed'];
const STRATEGIC_AMBITION = ['Compliance only', 'Compliance and optimization', 'Strategic transformation'];
const REPORT_TYPE = ['Diagnostic Report', 'Full Assessment'];

const ENHANCED_DATA_READINESS = [
  'Not aware of structured address / enhanced data requirements',
  'Aware but not yet started planning',
  'Planning phase — mapping data fields and assessing data quality',
  'Ready for November 2026 structured address deadline'
];

const PRIMARY_COMPLIANCE_MOTIVATION = [
  'Regulatory obligation (must comply)',
  'Cost reduction (translation fees)',
  'Cost reduction through lower transaction fees',
  'Competitive positioning',
  'Client demand',
  'All of the above'
];

const STEP_TITLES = [
  'Institution Profile',
  'Transaction Profile',
  'Technical Infrastructure',
  'Strategic Orientation',
  'Budget & Timeline',
  'Financial Impact',
  'Market Context',
  'Strategic Horizon',
  'Organizational Readiness'
];

const UnifiedDiscoveryTool = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DiscoveryFormData>({ ...INITIAL_FORM });
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState(0);
  const [corridorVersion, setCorridorVersion] = useState(0);
  const importRef = useRef<HTMLInputElement>(null);
  const COOLDOWN_MS = 3000;
  const TOTAL_STEPS = 9;

  const [isValidating, setIsValidating] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    try {
      const passwordHash = await sha256(password);
      const { data, error } = await supabase.functions.invoke('validate-password', {
        body: { passwordHash, tool: 'discovery' }
      });
      if (error || !data?.valid) {
        setShowError(true);
      } else {
        setIsAuthenticated(true);
        setShowError(false);
      }
    } catch {
      setShowError(true);
    } finally {
      setIsValidating(false);
    }
  };

  const update = <K extends keyof DiscoveryFormData>(key: K, value: DiscoveryFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleRegionToggle = (region: string, checked: boolean) => {
    if (region === 'Global (all regions)') {
      if (checked) {
        update('regions', ['Global (all regions)']);
        update('isGlobal', true);
      } else {
        update('regions', []);
        update('isGlobal', false);
      }
    } else {
      const newRegions = checked
        ? [...formData.regions.filter(r => r !== 'Global (all regions)'), region]
        : formData.regions.filter(r => r !== region);
      update('regions', newRegions);
      update('isGlobal', false);
    }
  };

  const handleMsgFormatToggle = (fmt: string, checked: boolean) => {
    const newFmts = checked
      ? [...formData.messagingFormats, fmt]
      : formData.messagingFormats.filter(f => f !== fmt);
    update('messagingFormats', newFmts);
  };

  const handleCorridorRegionToggle = (region: string, checked: boolean) => {
    const newRegions = checked
      ? [...formData.primaryCorridorRegions, region]
      : formData.primaryCorridorRegions.filter(r => r !== region);
    update('primaryCorridorRegions', newRegions);
  };

  // Corridor helpers removed — managed inside Step2 component

  const nextStep = () => { if (currentStep < TOTAL_STEPS) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (importRef.current) importRef.current.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        const assessmentType = json.assessmentType || json.version;
        if (assessmentType !== 'unified-discovery-v1') {
          toast({ title: 'Invalid file', description: 'Must be a unified Discovery assessment JSON (assessmentType: unified-discovery-v1)', variant: 'destructive' });
          return;
        }
        const ip = json.institutionProfile || {};
        const tp = json.transactionProfile || {};
        const tech = json.technicalProfile || json.technicalInfrastructure || {};
        const sp = json.strategicProfile || json.strategicOrientation || {};
        const bp = json.budgetProfile || json.budgetTimeline || {};
        const fip = json.financialImpactProfile || json.financialImpact || {};
        const mcp = json.marketContextProfile || json.marketContext || {};
        const shp = json.strategicHorizonProfile || json.strategicHorizon || {};
        const op = json.organizationalProfile || json.organizationalReadiness || {};
        // Also pull legacy top-level sections
        const ra = json.readinessAssessment || {};
        const tr = json.technicalRequirements || {};
        const spLegacy = json.strategicPreferences || {};
        const tca = json.translationCostAnalysis || {};

        const safeStr = (v: any, fallback = '') => {
          if (typeof v === 'string') return v;
          if (typeof v === 'number') return String(v);
          return fallback;
        };
        const safeNum = (v: any, fallback = 0) => typeof v === 'number' ? v : (typeof v === 'string' ? (parseFloat(v) || fallback) : fallback);
        const safeBool = (v: any, fallback = false) => {
          if (typeof v === 'boolean') return v;
          if (typeof v === 'string') {
            const l = v.toLowerCase();
            if (l === 'yes' || l === 'true') return true;
            if (l === 'no' || l === 'false') return false;
          }
          return fallback;
        };
        const safeArr = (v: any, fallback: any[] = []): any[] => {
          if (Array.isArray(v)) return v;
          if (v == null) return fallback;
          if (typeof v === 'string') return [v];
          return fallback;
        };

        // Boolean → "Yes"/"No" for radio fields
        const normBoolStr = (v: any): string => {
          if (v === true || v === 'true') return 'Yes';
          if (v === false || v === 'false') return 'No';
          if (typeof v === 'string') {
            const l = v.toLowerCase();
            if (l === 'yes') return 'Yes';
            if (l === 'no') return 'No';
            if (l === 'partial') return 'Partial';
            if (l === 'full') return 'Yes';
            if (l === 'none') return 'No';
          }
          return typeof v === 'string' ? v : '';
        };

        // Normalize ISO capability booleans → Yes/No/Partial
        const normIso = (v: any): string => {
          if (v === true || v === 'true') return 'Yes';
          if (v === false || v === 'false') return 'No';
          if (typeof v === 'string') {
            const l = v.toLowerCase();
            if (l === 'yes') return 'Yes';
            if (l === 'no') return 'No';
            if (l === 'partial' || l === 'in progress') return 'Partial';
          }
          return typeof v === 'string' ? v : '';
        };

        // Normalize extendedFieldsCapable: bool → Full/None
        const normExtended = (v: any): string => {
          if (v === true || v === 'true') return 'Full';
          if (v === false || v === 'false') return 'None';
          if (typeof v === 'string') {
            const l = v.toLowerCase();
            if (l === 'full' || l === 'yes') return 'Full';
            if (l === 'partial' || l === 'limited') return 'Partial';
            if (l === 'none' || l === 'no') return 'None';
          }
          return typeof v === 'string' ? v : '';
        };

        // Normalize SWIFT opt-in status
        const normSwiftOptIn = (v: any): string => {
          if (!v || typeof v !== 'string') return '';
          if (v.includes('(using translation)') || v.includes('(fully MX)')) return v;
          const l = v.toLowerCase();
          if (l === 'opted in' || l.includes('paying fees')) return 'Opted in — currently paying fees';
          if (l === 'opted out' || l.includes('native iso')) return 'Opted out — native ISO 20022';
          if (l.includes('unknown') || l.includes('not assessed')) return 'Unknown or not assessed';
          return v;
        };

        // Alias map for known import mismatches
        const ALIAS_MAP: Record<string, Record<string, string>> = {
          institutionType: {
            'Asset Manager': 'Other', 'Fintech': 'Payment Institution', 'Fintech payment provider': 'Payment Institution',
            'Asset manager': 'Other', 'Community Bank': 'Regional Bank', 'Community bank': 'Regional Bank', 'Investment Manager': 'Other',
          },
          assetSize: {
            '€500M-€1B': 'Under €1B', '€100M-€500M': 'Under €1B', 'Under €500M': 'Under €1B',
            '€1B-€5B': '€1B-€10B', '€5B-€10B': '€1B-€10B', '€10B-€50B': '€10B-€50B',
            '€50B-€100B': '€50B-€200B', '€100B-€200B': '€50B-€200B',
          },
          systemAge: {
            '1-2 years old': '1-2 years old', '3-5 years old': '3-5 years old',
            '5-7 years old': '5-10 years old', '7-10 years old': '5-10 years old', '5-10 years old': '5-10 years old',
            '10+ years old': 'Over 10 years old', '10-15 years old': 'Over 10 years old', 'Over 10 years old': 'Over 10 years old',
          },
          swiftConnectivity: {
            'SWIFT GPI': 'Alliance Access', 'SWIFT Service Bureau': 'Service Bureau', 'Service Bureau': 'Service Bureau',
            'Alliance Access': 'Alliance Access', 'Alliance Lite2': 'Alliance Lite2', 'Direct connection': 'Direct', 'None': 'None',
          },
          isoReceiveCapable: {
            'Partial': 'In progress', 'partial': 'In progress', 'Yes': 'Yes', 'No': 'No', 'true': 'Yes', 'false': 'No',
          },
          isoSendCapable: {
            'Partial': 'In progress', 'partial': 'In progress', 'Yes': 'Yes', 'No': 'No', 'true': 'Yes', 'false': 'No',
          },
          extendedFieldsCapable: {
            'Full': 'Yes', 'Partial': 'In progress', 'None': 'No', 'full': 'Yes', 'partial': 'In progress', 'none': 'No',
            'Limited': 'Partial',
          },
          dltStrategyMaturity: {
            'No strategy': 'Not exploring', 'No DLT strategy': 'Not exploring', 'Research phase': 'Monitoring developments',
            'Research': 'Monitoring developments', 'Exploring': 'Exploring / Learning', 'Exploring / Learning': 'Exploring / Learning',
            'Evaluating': 'Actively evaluating', 'Actively evaluating': 'Actively evaluating',
            'Actively piloting': 'Active pilot / POC', 'Pilot': 'Active pilot / POC', 'Active pilot / POC': 'Active pilot / POC',
            'Production': 'Production deployment', 'Production deployment': 'Production deployment',
          },
          november2026Priority: {
            'Critical priority': 'Critical priority', 'High priority': 'Active planning', 'Already planning': 'Active planning',
            'Active planning': 'Active planning', 'Aware but not planning': 'On our radar', 'Aware but not yet planning': 'On our radar',
            'On our radar': 'On our radar', 'Not planning': 'Not yet planned', 'Not yet planned': 'Not yet planned',
            'Planning phase': 'Active planning', 'Compliant': 'Compliant',
          },
          enhancedDataMandateReadiness: {
            'Not started': 'Not aware of structured address / enhanced data requirements',
            'Not aware': 'Not aware of structured address / enhanced data requirements',
            'Aware': 'Aware but not yet started planning', 'Aware but not yet started planning': 'Aware but not yet started planning',
            'Planning stage': 'Planning phase — mapping data fields and assessing data quality',
            'Planning': 'Planning phase — mapping data fields and assessing data quality',
            'In progress': 'Planning phase — mapping data fields and assessing data quality',
            'Implementation started': 'Planning phase — mapping data fields and assessing data quality',
            'Ready': 'Ready for November 2026 structured address deadline',
            'Complete': 'Ready for November 2026 structured address deadline',
          },
          primaryComplianceMotivation: {
            'Regulatory requirement': 'Regulatory obligation (must comply)', 'Regulatory obligation': 'Regulatory obligation (must comply)',
            'Regulatory obligation (must comply)': 'Regulatory obligation (must comply)',
            'Competitive advantage': 'Competitive positioning', 'Competitive positioning': 'Competitive positioning',
            'Cost reduction': 'Cost reduction (translation fees)', 'Cost reduction (translation fees)': 'Cost reduction (translation fees)',
            'Cost reduction through lower transaction fees': 'Cost reduction through lower transaction fees',
            'Client demand': 'Client demand', 'All of the above': 'All of the above',
          },
          vendorSelectionStatus: {
            'Not started': 'Not started', 'Early evaluation': 'Evaluating options', 'Evaluating options': 'Evaluating options',
            'Shortlisted': 'Shortlisted vendors', 'Shortlisted vendors': 'Shortlisted vendors', 'Selected': 'Selected', 'Contracted': 'Contracted',
          },
          digitalAssetExposure: {
            'None': 'None', 'Monitoring': 'Monitoring only', 'Monitoring only': 'Monitoring only',
            'Exploring': 'Pilot or exploring', 'Pilot or exploring': 'Pilot or exploring',
            'Exploring (€1M-€10M)': 'Pilot or exploring', 'Significant (>€10M)': 'Operational', 'Operational': 'Operational',
          },
          institutionClassification: {
            'Asset manager': 'Specialized institution', 'Asset Manager': 'Specialized institution',
            'Fintech payment provider': 'Specialized institution', 'Fintech': 'Specialized institution',
            'Community bank': 'Regional bank', 'Community Bank': 'Regional bank',
            'Commercial bank': 'Commercial bank', 'Commercial Bank': 'Commercial bank',
            'Savings bank': 'Savings bank', 'Regional bank': 'Regional bank', 'Regional Bank': 'Regional bank',
            'Credit cooperative': 'Credit cooperative', 'Investment bank': 'Specialized institution',
          },
          geographicFootprint: {
            'Domestic only': 'Domestic only', 'Domestic US': 'Domestic only',
            'European': 'Europe broad', 'Europe broad': 'Europe broad', 'Eurozone': 'Eurozone',
            'Asia-Pacific': 'Global', 'Global': 'Global', 'International': 'Global',
          },
          boardAwarenessLevel: {
            'No awareness': 'No awareness', 'Basic awareness': 'Partial awareness', 'Awareness': 'Awareness',
            'Partial awareness': 'Partial awareness', 'Moderate awareness': 'Moderate awareness',
            'Full board engagement': 'Full awareness and active engagement', 'Full awareness': 'Full awareness and active engagement',
            'Full awareness and active engagement': 'Full awareness and active engagement',
          },
          strategicAmbition: {
            'Compliance only': 'Compliance only', 'Compliance minimum': 'Compliance only',
            'Compliance and stability': 'Compliance and optimization', 'Compliance and optimization': 'Compliance and optimization',
            'Market leadership': 'Strategic transformation', 'Strategic transformation': 'Strategic transformation',
            'Operational excellence': 'Compliance and optimization',
          },
          executiveSponsorship: {
            'No sponsorship': 'No sponsorship', 'None': 'No sponsorship', 'Limited awareness': 'Awareness', 'Awareness': 'Awareness',
            'Partial commitment': 'Active support', 'Active support': 'Active support',
            'Full commitment': 'Strong commitment', 'Strong commitment': 'Strong commitment',
            'C-level champion': 'C-level champion', 'C-suite champion': 'C-suite champion',
          },
          reconciliationComplexity: {
            'Low': 'Simple', 'Simple': 'Simple', 'Medium': 'Moderate', 'Moderate': 'Moderate',
            'High': 'Complex', 'Complex': 'Complex', 'Very High': 'Very Complex', 'Very Complex': 'Very Complex',
          },
        };

        // Normalize imported dropdown values to match exact option lists
        const matchOption = (val: string, options: string[], fieldKey?: string): string => {
          if (!val) return '';
          // 1. Check alias map first (most reliable)
          if (fieldKey && ALIAS_MAP[fieldKey]) {
            const alias = ALIAS_MAP[fieldKey][val] || ALIAS_MAP[fieldKey][val.toLowerCase()];
            if (alias && options.includes(alias)) return alias;
          }
          // 2. Exact match
          if (options.includes(val)) return val;
          // 3. Case-insensitive match
          const lower = val.toLowerCase();
          const found = options.find(o => o.toLowerCase() === lower);
          if (found) return found;
          // 4. Partial match (contains)
          const partial = options.find(o =>
            lower.includes(o.toLowerCase()) || o.toLowerCase().includes(lower)
          );
          return partial || val;
        };

        // Normalize banking relationships to match BANKING_PARTNERS canonical names
        const rawBanking = safeArr(ip.bankingRelationships);
        const normalizedBanking = rawBanking.map((b: string) => normalizeBankName(b) || b);

        // Normalize corridors array
        const normCorridors = (raw: any): Array<{currencyPair: string; monthlyVolume: number; volumeShare?: number; enabled?: boolean}> => {
          const arr = safeArr(raw, [{ currencyPair: '', monthlyVolume: 0 }]);
          return arr.map((c: any) => {
            if (typeof c === 'string') return { currencyPair: c, monthlyVolume: 0, volumeShare: 0, enabled: true };
            return {
              currencyPair: safeStr(c.currencyPair || c.name, ''),
              monthlyVolume: safeNum(c.monthlyVolume),
              volumeShare: safeNum(c.volumeShare),
              enabled: c.enabled !== false,
            };
          });
        };

        // Normalize itTeamSize: number → string, then match
        const normItTeamSize = (v: any): string => {
          const s = typeof v === 'number' ? String(v) : safeStr(v);
          // If it's a raw number string like "8", try to find the right bucket
          if (/^\d+$/.test(s)) {
            const n = parseInt(s, 10);
            if (n === 0) return '0';
            if (n <= 2) return '1-2';
            if (n <= 5) return '3-5';
            if (n <= 9) return '6-9';
            if (n <= 25) return '10-25';
            return '26+';
          }
          // Check for "X dedicated" pattern like "10-25 dedicated"
          const dedMatch = s.match(/^(\d[\d\-+]*)/);
          if (dedMatch) return matchOption(dedMatch[1], TEAM_SIZES);
          return matchOption(s, TEAM_SIZES);
        };

        const imported: DiscoveryFormData = {
          ...INITIAL_FORM,
          // === INSTITUTION PROFILE ===
          institutionName: safeStr(ip.name || ip.institutionName),
          institutionType: matchOption(safeStr(ip.type || ip.institutionType), INSTITUTION_TYPES, 'institutionType'),
          totalAssets: matchOption(safeStr(ip.assetSize || ip.totalAssets), ASSET_SIZES, 'assetSize'),
          countriesOfOperation: safeNum(ip.countries ?? ip.countriesOfOperation),
          regions: safeArr(ip.regions),
          isGlobal: safeBool(ip.isGlobal),
          bankingRelationships: normalizedBanking,
          otherBankingRelationships: safeStr(ip.otherBankingRelationships),
          // === TRANSACTION PROFILE ===
          monthlyVolume: safeNum(tp.monthlyVolume ?? json.totalMonthlyVolume),
          annualGrowthRate: typeof tp.annualGrowthRate === 'number' ? tp.annualGrowthRate : (parseInt(String(tp.annualGrowthRate)) || 0),
          crossBorderPercent: safeNum(tp.crossBorderPercent ?? tp.crossBorderPercentage),
          corridors: normCorridors(tp.corridors ?? json.corridors),
          currencyCount: safeNum(tp.currencyCount ?? tp.currenciesHandled),
          messageDistribution: (tp.messageDistribution || tp.messageTypeDistribution) ? {
            mt103: safeNum((tp.messageDistribution || tp.messageTypeDistribution)?.mt103),
            mt202: safeNum((tp.messageDistribution || tp.messageTypeDistribution)?.mt202),
            mt900: safeNum((tp.messageDistribution || tp.messageTypeDistribution)?.mt900),
            mt910: safeNum((tp.messageDistribution || tp.messageTypeDistribution)?.mt910),
            other: safeNum((tp.messageDistribution || tp.messageTypeDistribution)?.other),
          } : { ...INITIAL_FORM.messageDistribution },
          reconciliationComplexity: matchOption(safeStr(tp.reconciliationComplexity), RECON_COMPLEXITY, 'reconciliationComplexity'),
          // === TECHNICAL PROFILE ===
          coreSystem: matchOption(safeStr(tech.coreSystem || tech.coreBankingSystem), CORE_SYSTEMS),
          systemAge: matchOption(safeStr(tech.systemAge || tech.currentSystemAge || ra.currentSystemAge), SYSTEM_AGES, 'systemAge'),
          swiftConnectivity: matchOption(safeStr(tech.swiftConnectivity || tech.existingSwiftInfrastructure || tr.existingSwiftInfrastructure), SWIFT_OPTIONS, 'swiftConnectivity'),
          messagingFormats: (() => {
            const raw = tech.messagingFormats;
            if (typeof raw === 'string') return [raw];
            if (Array.isArray(raw) && raw.length) return raw;
            const mf = tech.messagingFormat;
            if (mf && typeof mf === 'object') {
              const fmts: string[] = [];
              if (mf.mt) fmts.push('MT (legacy SWIFT)');
              if (mf.iso20022) fmts.push('ISO 20022 (MX)');
              if (mf.proprietary) fmts.push('Proprietary format');
              if (mf.multiple) fmts.push('Multiple formats');
              return fmts;
            }
            return [];
          })(),
          isoSendCapable: matchOption(normIso(tech.isoSendCapable || tech.iso20022SendCapability), [...YES_NO_IP, 'Partial'], 'isoSendCapable'),
          isoReceiveCapable: matchOption(normIso(tech.isoReceiveCapable || tech.iso20022ReceiveCapability), [...YES_NO_IP, 'Partial'], 'isoReceiveCapable'),
          extendedFieldsCapable: matchOption(normExtended(tech.extendedFieldsCapable || tech.extendedDataCapability), YES_NO_PARTIAL, 'extendedFieldsCapable'),
          integrationComplexity: matchOption(safeStr(tech.integrationComplexity), COMPLEXITY),
          itTeamSize: normItTeamSize(tech.itTeamSize),
          blockchainExperience: safeBool(tech.blockchainExperience),
          // === STRATEGIC PROFILE ===
          dltStrategyMaturity: matchOption(safeStr(sp.dltStrategyMaturity || sp.dltMaturity), DLT_MATURITY, 'dltStrategyMaturity'),
          november2026Priority: matchOption(safeStr(sp.november2026Priority || sp.nov2026StructuredAddressPriority), NOV_2026_PRIORITY, 'november2026Priority'),
          enhancedDataMandateReadiness: matchOption(safeStr(sp.enhancedDataMandateReadiness || sp.enhancedDataReadiness), ENHANCED_DATA_READINESS, 'enhancedDataMandateReadiness'),
          primaryComplianceMotivation: matchOption(safeStr(sp.primaryComplianceMotivation || sp.primaryMotivation || spLegacy.primaryMotivation), PRIMARY_COMPLIANCE_MOTIVATION, 'primaryComplianceMotivation'),
          // === BUDGET PROFILE ===
          complianceBudget: matchOption(safeStr(bp.complianceBudget), BUDGETS),
          urgency: matchOption(safeStr(bp.urgency || bp.implementationUrgency), URGENCIES),
          targetGoLive: safeStr(bp.targetGoLive || bp.targetGoLiveDate || ''),
          translationFeeTolerance: matchOption(safeStr(bp.translationFeeTolerance), FEE_TOLERANCE),
          vendorSelectionStatus: matchOption(safeStr(bp.vendorSelectionStatus), VENDOR_STATUS, 'vendorSelectionStatus'),
          // === FINANCIAL IMPACT PROFILE ===
          nostroRelationshipCount: matchOption(safeStr(fip.nostroRelationshipCount), NOSTRO_COUNTS),
          nostroBalanceRange: matchOption(safeStr(fip.nostroBalanceRange), NOSTRO_BALANCES),
          costOfCapital: matchOption(safeStr(fip.costOfCapital || fip.costSensitivity), COST_OF_CAPITAL),
          monthlyPaymentRepairVolume: matchOption(safeStr(fip.monthlyPaymentRepairVolume), REPAIR_VOLUMES),
          truncationRejections: matchOption(safeStr(fip.truncationRejections), TRUNCATION_OPTIONS),
          capitalTreatmentAwareness: matchOption(safeStr(fip.capitalTreatmentAwareness || fip.budgetApprovalStatus), CAPITAL_TREATMENT),
          digitalAssetExposure: matchOption(safeStr(fip.digitalAssetExposure), DIGITAL_ASSET_EXPOSURE, 'digitalAssetExposure'),
          // === MARKET CONTEXT PROFILE ===
          institutionClassification: matchOption(safeStr(mcp.institutionClassification || mcp.marketPosition), INST_CLASSIFICATION, 'institutionClassification'),
          geographicFootprint: matchOption(safeStr(mcp.geographicFootprint || mcp.differentiationStrategy), GEO_FOOTPRINT, 'geographicFootprint'),
          primaryCorridorRegions: safeArr(mcp.primaryCorridorRegions),
          boardAwarenessLevel: matchOption(safeStr(mcp.boardAwarenessLevel || mcp.regulatoryPressureLevel), BOARD_AWARENESS, 'boardAwarenessLevel'),
          peerBenchmarkConsent: safeBool(mcp.peerBenchmarkConsent),
          // === STRATEGIC HORIZON PROFILE ===
          swiftTranslationOptInStatus: matchOption(normSwiftOptIn(shp.swiftTranslationOptInStatus), SWIFT_OPT_IN),
          structuredAddressReadiness: matchOption(safeStr(shp.structuredAddressReadiness), ADDRESS_READINESS),
          lastSwiftStandardsReview: matchOption(safeStr(shp.lastSwiftStandardsReview || shp.technologyRoadmap), SWIFT_REVIEW),
          strategicAmbition: matchOption(safeStr(shp.strategicAmbition || shp.fiveYearVision), STRATEGIC_AMBITION, 'strategicAmbition'),
          reportTypeRequested: matchOption(safeStr(shp.reportTypeRequested), REPORT_TYPE),
          // === ORGANIZATIONAL PROFILE ===
          executiveSponsorship: matchOption(safeStr(op.executiveSponsorship || op.executiveSupport), SPONSORSHIP, 'executiveSponsorship'),
          dedicatedPM: normBoolStr(op.dedicatedPM ?? op.projectGovernance),
          changeManagement: matchOption(safeStr(op.changeManagement || op.changeManagementCapability), CHANGE_MGMT),
          testingEnvironment: matchOption(normBoolStr(op.testingEnvironment), YES_NO_PARTIAL),
          rollbackCapability: matchOption(normBoolStr(op.rollbackCapability), YES_NO_PARTIAL),
          staffTraining: matchOption(safeStr(op.staffTraining || op.staffTrainingNeeds), TRAINING),
        };

        setFormData(imported);
        setCorridorVersion(v => v + 1);
        setCurrentStep(0);
        toast({ title: 'Assessment data imported', description: 'Please review all fields before proceeding.' });
      } catch (err: any) {
        console.error('Import error:', err);
        toast({ title: 'Invalid file', description: err?.message || 'Could not parse JSON file', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateReport = () => {
    const now = Date.now();
    if (isExporting || now - lastExport < COOLDOWN_MS) {
      toast({ title: 'Please wait', description: 'Wait 3 seconds between exports' });
      return;
    }
    const distTotal = formData.messageDistribution.mt103 + formData.messageDistribution.mt202 + formData.messageDistribution.mt900 + formData.messageDistribution.mt910 + formData.messageDistribution.other;
    if (distTotal !== 100) {
      toast({ title: 'Validation Error', description: 'Message Type Distribution percentages must total 100% before export.', variant: 'destructive' });
      return;
    }
    setIsExporting(true);
    try {
      generateDiscoveryPDF(formData);
      generateDiscoveryJSON(formData);
      setLastExport(Date.now());
      toast({ title: 'Reports Generated', description: 'PDF and JSON downloaded successfully' });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate reports', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const scores = currentStep === TOTAL_STEPS ? calculateScores(formData) : null;

  // === LOGIN ===
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <BrandShaderGradient variant="hero" />
        <div className="absolute inset-0 bg-background/85 pointer-events-none" />
        <div className="max-w-md w-full relative z-10">
          <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
            <div className="text-center mb-6">
              <img src={logo} alt="PBC Logo" className="h-20 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">ISO 20022 Unified Discovery</h1>
              <p className="text-muted-foreground font-medium">Client Access Only - Enter Password</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">Password</label>
                <input id="password" type="password" value={password}
                  onChange={(e) => { setPassword(e.target.value); setShowError(false); }}
                  className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  placeholder="Enter password" autoFocus />
              </div>
              {showError && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Incorrect password. Please try again.</span>
                </div>
              )}
              <button type="submit" disabled={isValidating} className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50">
                {isValidating ? 'Validating...' : 'Access Assessment'}
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">© 2025 Patrick Bayce-Chalvin</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === RESULTS ===
  if (currentStep === TOTAL_STEPS && scores) {
    const riskColorClass = scores.riskLevel === 'LOW' ? 'bg-accent/10 border-accent/30' :
      scores.riskLevel === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
      scores.riskLevel === 'HIGH' ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200';
    const barColor = scores.riskLevel === 'LOW' ? 'bg-accent' :
      scores.riskLevel === 'MEDIUM' ? 'bg-yellow-500' :
      scores.riskLevel === 'HIGH' ? 'bg-orange-500' : 'bg-red-500';

    return (
      <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
        <BrandShaderGradient variant="contact" />
        <div className="absolute inset-0 bg-background/90 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="bg-card rounded-lg shadow-lg p-6 md:p-8 border border-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">Unified Discovery Assessment</h1>
                <p className="text-muted-foreground">{formData.institutionName || 'Your Institution'}</p>
              </div>
              <img src={logo} alt="PBC Logo" className="h-16 md:h-20" />
            </div>

            {/* Score */}
            <div className={`p-6 rounded-lg mb-6 border-2 ${riskColorClass}`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">Overall Readiness Score</h2>
                <span className="text-4xl font-bold">{scores.overallReadiness}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className={`h-4 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${scores.overallReadiness}%` }} />
              </div>
            </div>

            {/* 3-col summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-secondary border border-accent/30 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Technical Readiness</p>
                <p className="text-3xl font-bold text-primary">{scores.technicalReadiness}</p>
              </div>
              <div className="bg-secondary border border-accent/30 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Organizational Readiness</p>
                <p className="text-3xl font-bold text-primary">{scores.organizationalReadiness}</p>
              </div>
              <div className="bg-secondary border border-accent/30 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  scores.riskLevel === 'LOW' ? 'bg-accent/15 text-accent' :
                  scores.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  scores.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>{scores.riskLevel}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button onClick={handleGenerateReport} disabled={isExporting}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50">
                <Download className="w-4 h-4" />
                {isExporting ? 'Generating...' : 'Generate Report (PDF + JSON)'}
              </button>
              <button onClick={() => setCurrentStep(0)}
                className="flex items-center gap-2 border border-input bg-background text-foreground px-6 py-3 rounded-lg font-medium hover:bg-accent transition">
                <ChevronLeft className="w-4 h-4" /> Edit Responses
              </button>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">© 2025 Patrick Bayce-Chalvin — ISO 20022 Unified Discovery Assessment</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === FORM STEPS ===
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
      <BrandShaderGradient variant="section" />
      <div className="absolute inset-0 bg-background/90 pointer-events-none" />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-card rounded-lg shadow-lg p-6 md:p-8 border border-border">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">ISO 20022 Unified Discovery</h1>
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground text-sm">Comprehensive Readiness Assessment</p>
                <input ref={importRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                <button onClick={() => importRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground border border-input bg-background px-2.5 py-1 rounded-md hover:bg-accent transition">
                  <Upload className="w-3 h-3" /> Import Previous Assessment (JSON)
                </button>
              </div>
            </div>
            <img src={logo} alt="PBC Logo" className="h-14 md:h-16" />
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Step {currentStep + 1} of {TOTAL_STEPS}</span>
              <span className="text-sm text-muted-foreground">{STEP_TITLES[currentStep]}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              {STEP_TITLES.map((t, i) => (
                <button key={i} onClick={() => setCurrentStep(i)}
                  className={`text-xs hidden md:block ${i === currentStep ? 'text-accent font-semibold' : i < currentStep ? 'text-accent' : 'text-muted-foreground'}`}>
                  {i < currentStep ? '✓' : i + 1}. {t}
                </button>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="space-y-6 mb-8">
            {currentStep === 0 && <Step1 formData={formData} update={update} handleRegionToggle={handleRegionToggle}
              handleBankToggle={(bank: string, checked: boolean) => {
                const current = formData.bankingRelationships || [];
                if (checked) {
                  update('bankingRelationships', [...current, bank]);
                } else {
                  update('bankingRelationships', current.filter(b => b !== bank));
                  if (bank === 'Other (specify below)') update('otherBankingRelationships', '');
                }
              }} />}
            {currentStep === 1 && <Step2 key={corridorVersion} formData={formData} update={update} />}
            {currentStep === 2 && <Step3 formData={formData} update={update} handleMsgFormatToggle={handleMsgFormatToggle} />}
            {currentStep === 3 && <Step4 formData={formData} update={update} />}
            {currentStep === 4 && <Step5 formData={formData} update={update} />}
            {currentStep === 5 && <StepFinancialImpact formData={formData} update={update} />}
            {currentStep === 6 && <StepMarketContext formData={formData} update={update} handleCorridorRegionToggle={handleCorridorRegionToggle} />}
            {currentStep === 7 && <StepStrategicHorizon formData={formData} update={update} />}
            {currentStep === 8 && <Step9OrgReadiness formData={formData} update={update} />}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <button onClick={prevStep} disabled={currentStep === 0}
              className="flex items-center gap-2 border border-input bg-background text-foreground px-4 py-2 rounded-lg font-medium hover:bg-accent transition disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {currentStep < TOTAL_STEPS - 1 ? (
              <button onClick={nextStep}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={nextStep}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition">
                <CheckCircle className="w-4 h-4" /> View Results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// === Reusable field components ===
const FieldLabel = ({ label, helper }: { label: string; helper?: string }) => (
  <div className="mb-1.5">
    <label className="block text-sm font-medium text-foreground">{label}</label>
    {helper && <p className="text-xs text-muted-foreground mt-0.5 flex items-start gap-1"><Info className="w-3 h-3 mt-0.5 flex-shrink-0" />{helper}</p>}
  </div>
);

const SelectField = ({ label, value, options, onChange, helper }: { label: string; value: string; options: string[]; onChange: (v: string) => void; helper?: string }) => (
  <div>
    <FieldLabel label={label} helper={helper} />
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-input bg-background rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring">
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const RadioField = ({ label, value, options, onChange, helper }: { label: string; value: string; options: string[]; onChange: (v: string) => void; helper?: string }) => (
  <div>
    <FieldLabel label={label} helper={helper} />
    <div className="space-y-2 mt-2">
      {options.map(o => (
        <label key={o} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
          <input type="radio" name={label} value={o} checked={value === o} onChange={() => onChange(o)}
            className="mt-0.5 h-4 w-4 text-primary border-input focus:ring-ring" />
          <span className="text-sm text-foreground">{o}</span>
        </label>
      ))}
    </div>
  </div>
);

// === STEP COMPONENTS ===
const BANKING_PARTNERS = [
  'JPMorgan Chase', 'Deutsche Bank', 'Standard Chartered', 'DBS Bank',
  'BNP Paribas', 'Société Générale', 'HSBC', 'Barclays',
  'Citibank', 'Bank of America', 'UBS', 'Credit Suisse',
  'ING', 'Santander', 'UniCredit', 'Other (specify below)',
];

// Normalize banking partner names for import matching (handles accent variants)
const normalizeBankName = (name: string): string | null => {
  const lower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const bank of BANKING_PARTNERS) {
    const bankLower = bank.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lower === bankLower) return bank;
  }
  return null;
};

const Step1 = ({ formData: d, update, handleRegionToggle, handleBankToggle }: { formData: DiscoveryFormData; update: any; handleRegionToggle: (r: string, c: boolean) => void; handleBankToggle: (bank: string, checked: boolean) => void }) => (
  <>
    <h2 className="text-xl font-bold text-foreground">Step 1: Institution Profile</h2>
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <FieldLabel label="Institution Name" />
        <input type="text" value={d.institutionName} onChange={e => update('institutionName', e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring"
          placeholder="Your institution name" />
      </div>
      <SelectField label="Institution Type" value={d.institutionType} options={INSTITUTION_TYPES} onChange={v => update('institutionType', v)} />
      <SelectField label="Total Assets" value={d.totalAssets} options={ASSET_SIZES} onChange={v => update('totalAssets', v)} />
      <div>
        <FieldLabel label="Number of Countries of Operation" />
        <input type="number" min={0} value={d.countriesOfOperation || ''} onChange={e => update('countriesOfOperation', parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-input bg-background rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring" />
      </div>
    </div>
    <div>
      <FieldLabel label="Geographic Regions" helper="If 'Global' is checked, all other selections will be cleared." />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
        {REGIONS.map(r => (
          <label key={r} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
            <input type="checkbox" checked={d.regions.includes(r)} onChange={e => handleRegionToggle(r, e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
            <span className="text-sm text-foreground">{r}</span>
          </label>
        ))}
      </div>
      {d.isGlobal && (
        <div className="mt-2 p-2 bg-secondary border border-accent/30 rounded-lg text-sm text-foreground flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Global operations selected — all regions included.
        </div>
      )}
    </div>
    <div>
      <FieldLabel label="Existing Banking Relationships" helper="Some platforms require existing banking relationships for access. Select institutions where your organization maintains corporate banking services." />
      <div className="grid grid-cols-2 gap-2 mt-2">
        {BANKING_PARTNERS.map(bank => (
          <label key={bank} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
            <input type="checkbox" checked={d.bankingRelationships?.includes(bank) || false} onChange={e => handleBankToggle(bank, e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
            <span className="text-sm text-foreground">{bank}</span>
          </label>
        ))}
      </div>
      {d.bankingRelationships?.includes('Other (specify below)') && (
        <div className="mt-3">
          <input type="text" placeholder="Specify other banking relationships..." value={d.otherBankingRelationships || ''}
            onChange={e => update('otherBankingRelationships', e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring" />
        </div>
      )}
    </div>
  </>
);

const COMMON_PAIRS = [
  'EUR-USD', 'EUR-GBP', 'EUR-CHF', 'EUR-CNY',
  'EUR-JPY', 'EUR-SGD', 'EUR-AUD', 'EUR-CAD',
  'EUR-SEK', 'EUR-NOK', 'EUR-PLN', 'EUR-DKK',
  'GBP-USD', 'USD-JPY', 'USD-CNY', 'USD-SGD',
  'USD-MXN', 'USD-BRL', 'USD-INR', 'USD-HKD',
];

const Step2 = ({ formData: d, update }: { formData: DiscoveryFormData; update: any }) => {
  // Derive initial state from existing corridors
  const initRef = useRef(false);
  const [gridState, setGridState] = useState<Record<string, { checked: boolean; volume: number }>>(() => {
    const state: Record<string, { checked: boolean; volume: number }> = {};
    COMMON_PAIRS.forEach(p => {
      const existing = d.corridors.find(c => c.currencyPair === p);
      state[p] = { checked: !!existing && existing.monthlyVolume > 0, volume: existing?.monthlyVolume || 0 };
    });
    return state;
  });
  const [customCorridors, setCustomCorridors] = useState<{ currencyPair: string; monthlyVolume: number }[]>(() => {
    return d.corridors.filter(c => c.currencyPair && !COMMON_PAIRS.includes(c.currencyPair));
  });

  const syncCorridors = useCallback((grid: typeof gridState, custom: typeof customCorridors) => {
    const corridors: { currencyPair: string; monthlyVolume: number }[] = [];
    COMMON_PAIRS.forEach(p => {
      if (grid[p]?.checked && grid[p].volume > 0) {
        corridors.push({ currencyPair: p, monthlyVolume: grid[p].volume });
      }
    });
    custom.forEach(c => {
      if (c.currencyPair.trim() && c.monthlyVolume > 0) {
        corridors.push({ currencyPair: c.currencyPair.trim(), monthlyVolume: c.monthlyVolume });
      }
    });
    update('corridors', corridors.length > 0 ? corridors : [{ currencyPair: '', monthlyVolume: 0 }]);
  }, [update]);

  useEffect(() => {
    if (initRef.current) {
      syncCorridors(gridState, customCorridors);
    }
    initRef.current = true;
  }, [gridState, customCorridors, syncCorridors]);

  const togglePair = (pair: string) => {
    setGridState(prev => {
      const next = { ...prev, [pair]: { checked: !prev[pair].checked, volume: prev[pair].checked ? 0 : prev[pair].volume } };
      return next;
    });
  };

  const setGridVolume = (pair: string, vol: number) => {
    setGridState(prev => ({ ...prev, [pair]: { ...prev[pair], volume: vol } }));
  };

  const addCustom = () => {
    setCustomCorridors(prev => [...prev, { currencyPair: '', monthlyVolume: 0 }]);
  };

  const removeCustom = (i: number) => {
    setCustomCorridors(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateCustom = (i: number, field: 'currencyPair' | 'monthlyVolume', value: any) => {
    setCustomCorridors(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  return (
    <>
      <h2 className="text-xl font-bold text-foreground">Step 2: Transaction Profile</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <FieldLabel label="Monthly Payment Message Volume" helper="Average number of payment messages per month. For volumes above 20M, contact us for enterprise assessment." />
          <input type="text" inputMode="numeric" value={d.monthlyVolume ? d.monthlyVolume.toLocaleString() : ''}
            onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); update('monthlyVolume', parseInt(raw) || 0); }}
            className="w-full px-3 py-2 border border-input bg-background rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring"
            placeholder="1,000 – 20,000,000" />
        </div>
        <div>
          <FieldLabel label="Annual Growth Rate %" helper="Expected annual growth in payment volumes over next 5 years" />
          <input type="number" min={0} max={50} value={d.annualGrowthRate || ''} onChange={e => update('annualGrowthRate', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-input bg-background rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring"
            placeholder="0-50%" />
        </div>
        <div>
          <FieldLabel label="Cross-Border Transaction %" />
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={100} value={d.crossBorderPercent}
              onChange={e => update('crossBorderPercent', parseInt(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none bg-secondary accent-primary" />
            <span className="text-sm font-semibold text-foreground w-12 text-right">{d.crossBorderPercent}%</span>
          </div>
        </div>
        <div>
          <FieldLabel label="Number of Currencies Handled" />
          <input type="number" min={0} value={d.currencyCount || ''} onChange={e => update('currencyCount', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-input bg-background rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      {/* Message Type Distribution */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">Message Type Distribution</h3>
        <p className="text-xs text-muted-foreground mb-3">Percentage breakdown of monthly message volume (must total 100%)</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'mt103' as const, label: 'MT103 — Customer Credit Transfers' },
            { key: 'mt202' as const, label: 'MT202 — Financial Institution Transfers' },
            { key: 'mt900' as const, label: 'MT900 — Debit Confirmations' },
            { key: 'mt910' as const, label: 'MT910 — Credit Confirmations' },
            { key: 'other' as const, label: 'Other message types' },
          ]).map(({ key, label }, idx, arr) => (
            <div key={key} className={idx === arr.length - 1 ? 'col-span-2 max-w-[calc(50%-0.375rem)]' : ''}>
              <label className="block text-sm text-foreground mb-1">{label}</label>
              <div className="flex items-center gap-1">
                <input type="number" min={0} max={100} step={1}
                  value={d.messageDistribution[key] || ''}
                  onChange={e => {
                    const val = Math.max(0, Math.min(100, Math.floor(Number(e.target.value) || 0)));
                    update('messageDistribution', { ...d.messageDistribution, [key]: val });
                  }}
                  className="w-full px-3 py-2 border border-input bg-background rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring"
                  placeholder="0" />
                <span className="text-sm font-medium text-muted-foreground">%</span>
              </div>
            </div>
          ))}
        </div>
        {(() => {
          const total = d.messageDistribution.mt103 + d.messageDistribution.mt202 + d.messageDistribution.mt900 + d.messageDistribution.mt910 + d.messageDistribution.other;
          const isValid = total === 100;
          return (
            <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${isValid ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {!isValid && <AlertCircle className="w-4 h-4" />}
              Total: {total}%
              {!isValid && <span className="font-normal text-xs ml-1">— Percentages must total 100% before export</span>}
            </div>
          );
        })()}
      </div>

      <SelectField label="Reconciliation Complexity" value={d.reconciliationComplexity} options={RECON_COMPLEXITY} onChange={v => update('reconciliationComplexity', v)} />

      {/* PART 1 — Pre-populated corridor grid */}
      <div>
        <FieldLabel label="Payment Corridors" helper="Select your active corridors and enter monthly volumes. Combined corridor volumes should not exceed total monthly volume." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
          {COMMON_PAIRS.map(pair => {
            const item = gridState[pair];
            return (
              <div key={pair}
                className={`rounded-lg border p-2.5 transition-colors ${item.checked ? 'bg-primary/10 border-primary/30' : 'bg-secondary/30 border-input'}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={item.checked} onChange={() => togglePair(pair)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
                  <span className="text-sm font-semibold text-foreground">{pair}</span>
                </label>
                {item.checked && (
                  <input type="number" min={0} value={item.volume || ''} autoFocus
                    onChange={e => setGridVolume(pair, e.target.valueAsNumber || 0)}
                    className="mt-1.5 w-full px-2 py-1.5 border border-input bg-background rounded text-foreground text-sm focus:ring-2 focus:ring-ring"
                    placeholder="Monthly volume" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PART 2 — Custom corridors */}
      <div>
        <FieldLabel label="Other corridors (not listed above)" />
        <div className="space-y-2 mt-2">
          {customCorridors.map((c, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" value={c.currencyPair} onChange={e => updateCustom(i, 'currencyPair', e.target.value)}
                className="flex-1 px-3 py-2 border border-input bg-background rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring"
                placeholder="e.g. EUR-TRY" />
              <input type="number" min={0} value={c.monthlyVolume || ''} onChange={e => updateCustom(i, 'monthlyVolume', e.target.valueAsNumber || 0)}
                className="w-32 px-3 py-2 border border-input bg-background rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring"
                placeholder="Monthly volume" />
              <button onClick={() => removeCustom(i)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button onClick={addCustom} className="flex items-center gap-1 text-sm text-primary hover:underline">
            <Plus className="w-4 h-4" /> Add custom corridor
          </button>
        </div>
      </div>
    </>
  );
};



const Step3 = ({ formData: d, update, handleMsgFormatToggle }: { formData: DiscoveryFormData; update: any; handleMsgFormatToggle: (f: string, c: boolean) => void }) => (
  <>
    <h2 className="text-xl font-bold text-foreground">Step 3: Technical Infrastructure</h2>
    <div className="grid md:grid-cols-2 gap-4">
      <SelectField label="Core Banking System" value={d.coreSystem} options={CORE_SYSTEMS} onChange={v => update('coreSystem', v)} />
      <SelectField label="System Version / Age" value={d.systemAge} options={SYSTEM_AGES} onChange={v => update('systemAge', v)} />
      <SelectField label="SWIFT Connectivity" value={d.swiftConnectivity} options={SWIFT_OPTIONS} onChange={v => update('swiftConnectivity', v)} />
      <SelectField label="Integration Complexity" value={d.integrationComplexity} options={COMPLEXITY} onChange={v => update('integrationComplexity', v)} />
      <SelectField label="IT Team Size (dedicated)" value={d.itTeamSize} options={TEAM_SIZES} onChange={v => update('itTeamSize', v)} />
    </div>
    <div>
      <FieldLabel label="Current Messaging Format" />
      <div className="grid grid-cols-2 gap-2 mt-2">
        {MSG_FORMATS.map(f => (
          <label key={f} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
            <input type="checkbox" checked={d.messagingFormats.includes(f)} onChange={e => handleMsgFormatToggle(f, e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
            <span className="text-sm text-foreground">{f}</span>
          </label>
        ))}
      </div>
    </div>
    <div className="grid md:grid-cols-3 gap-4">
      <RadioField label="ISO 20022 Send Capability" value={d.isoSendCapable} options={YES_NO_IP} onChange={v => update('isoSendCapable', v)} />
      <RadioField label="ISO 20022 Receive Capability" value={d.isoReceiveCapable} options={YES_NO_IP} onChange={v => update('isoReceiveCapable', v)} />
      <RadioField label="Extended Data Fields Capability" value={d.extendedFieldsCapable} options={YES_NO_PARTIAL} onChange={v => update('extendedFieldsCapable', v)} />
    </div>
    <div>
      <label className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50">
        <input type="checkbox" checked={d.blockchainExperience} onChange={e => update('blockchainExperience', e.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
        <div>
          <span className="text-sm font-medium text-foreground">DLT / Blockchain Experience</span>
          <p className="text-xs text-muted-foreground">Institution has prior DLT or blockchain project experience</p>
        </div>
      </label>
    </div>
  </>
);

const Step4 = ({ formData: d, update }: { formData: DiscoveryFormData; update: any }) => (
  <>
    <h2 className="text-xl font-bold text-foreground">Step 4: Strategic Orientation</h2>
    <SelectField
      label="DLT / Tokenized Settlement Strategy Maturity"
      value={d.dltStrategyMaturity}
      options={DLT_MATURITY}
      onChange={v => update('dltStrategyMaturity', v)}
    />
    <SelectField
      label="November 2026 Structured Address Deadline — Internal Priority"
      value={d.november2026Priority}
      options={NOV_2026_PRIORITY}
      onChange={v => update('november2026Priority', v)}
    />
    <RadioField label="Enhanced Data Mandate Readiness"
      helper="SWIFT's enhanced data mandate requires structured addresses by November 2026. This is separate from the November 2025 messaging format deadline."
      value={d.enhancedDataMandateReadiness}
      options={[
        'Not aware of structured address / enhanced data requirements',
        'Aware but not yet started planning',
        'Planning phase — mapping data fields and assessing data quality',
        'Ready for November 2026 structured address deadline'
      ]}
      onChange={v => update('enhancedDataMandateReadiness', v)} />
    <RadioField label="Primary Compliance Motivation"
      value={d.primaryComplianceMotivation}
      options={[
        'Regulatory obligation (must comply)',
        'Cost reduction (translation fees)',
        'Competitive positioning',
        'Client demand',
        'All of the above'
      ]}
      onChange={v => update('primaryComplianceMotivation', v)} />
  </>
);

const Step5 = ({ formData: d, update }: { formData: DiscoveryFormData; update: any }) => (
  <>
    <h2 className="text-xl font-bold text-foreground">Step 5: Budget & Timeline</h2>
    <div className="grid md:grid-cols-2 gap-4">
      <SelectField label="Total Compliance Budget Available" value={d.complianceBudget} options={BUDGETS} onChange={v => update('complianceBudget', v)} />
      <SelectField label="Implementation Urgency" value={d.urgency} options={URGENCIES} onChange={v => update('urgency', v)} />
      <div>
        <FieldLabel label="Target Go-Live Date (optional)" />
        <input type="date" value={d.targetGoLive} onChange={e => update('targetGoLive', e.target.value)}
          className="w-full px-3 py-2 border border-input bg-background rounded-lg text-foreground text-sm focus:ring-2 focus:ring-ring" />
      </div>
      <SelectField label="Translation Fee Tolerance per Month" value={d.translationFeeTolerance} options={FEE_TOLERANCE} onChange={v => update('translationFeeTolerance', v)} />
    </div>
    <SelectField label="Vendor Selection Status" value={d.vendorSelectionStatus} options={VENDOR_STATUS} onChange={v => update('vendorSelectionStatus', v)} />
  </>
);

const StepFinancialImpact = ({ formData: d, update }: { formData: DiscoveryFormData; update: any }) => (
  <>
    <h2 className="text-xl font-bold text-foreground">Step 6: Financial Impact Profile</h2>
    <p className="text-sm text-muted-foreground -mt-4">Used to calculate your total cost of sub-optimal payment infrastructure beyond visible translation fees.</p>
    <div className="grid md:grid-cols-2 gap-4">
      <SelectField label="Active correspondent banking relationships" value={d.nostroRelationshipCount} options={NOSTRO_COUNTS} onChange={v => update('nostroRelationshipCount', v)} />
      <SelectField label="Estimated total nostro balances (all corridors combined)" value={d.nostroBalanceRange} options={NOSTRO_BALANCES} onChange={v => update('nostroBalanceRange', v)}
        helper="Approximate range only. Select 'Prefer to discuss' if you prefer to provide this verbally." />
      <SelectField label="Internal hurdle rate / cost of capital" value={d.costOfCapital} options={COST_OF_CAPITAL} onChange={v => update('costOfCapital', v)}
        helper="Used to calculate nostro pre-funding opportunity cost." />
      <SelectField label="Monthly payment repairs due to data quality issues" value={d.monthlyPaymentRepairVolume} options={REPAIR_VOLUMES} onChange={v => update('monthlyPaymentRepairVolume', v)} />
      <SelectField label="Truncation rejections from correspondent banks" value={d.truncationRejections} options={TRUNCATION_OPTIONS} onChange={v => update('truncationRejections', v)} />
      <SelectField label="Basel III capital treatment assessment for current payment infrastructure" value={d.capitalTreatmentAwareness} options={CAPITAL_TREATMENT} onChange={v => update('capitalTreatmentAwareness', v)} />
      <SelectField label="Current exposure to tokenized assets or digital currencies" value={d.digitalAssetExposure} options={DIGITAL_ASSET_EXPOSURE} onChange={v => update('digitalAssetExposure', v)} />
    </div>
  </>
);

const StepMarketContext = ({ formData: d, update, handleCorridorRegionToggle }: { formData: DiscoveryFormData; update: any; handleCorridorRegionToggle: (r: string, c: boolean) => void }) => (
  <>
    <h2 className="text-xl font-bold text-foreground">Step 7: Market Context Profile</h2>
    <p className="text-sm text-muted-foreground -mt-4">Used for peer benchmarking against comparable institutions.</p>
    <div className="grid md:grid-cols-2 gap-4">
      <SelectField label="Institution type" value={d.institutionClassification} options={INST_CLASSIFICATION} onChange={v => update('institutionClassification', v)} />
      <SelectField label="Primary market footprint" value={d.geographicFootprint} options={GEO_FOOTPRINT} onChange={v => update('geographicFootprint', v)} />
    </div>
    <div>
      <FieldLabel label="Primary payment corridor regions" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
        {CORRIDOR_REGIONS.map(r => (
          <label key={r} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
            <input type="checkbox" checked={d.primaryCorridorRegions.includes(r)} onChange={e => handleCorridorRegionToggle(r, e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
            <span className="text-sm text-foreground">{r}</span>
          </label>
        ))}
      </div>
    </div>
    <SelectField label="Board-level awareness of post-deadline compliance status" value={d.boardAwarenessLevel} options={BOARD_AWARENESS} onChange={v => update('boardAwarenessLevel', v)} />
    <div>
      <label className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50">
        <input type="checkbox" checked={d.peerBenchmarkConsent} onChange={e => update('peerBenchmarkConsent', e.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
        <div>
          <span className="text-sm font-medium text-foreground">Contribute anonymized data to industry benchmarking</span>
          <p className="text-xs text-muted-foreground">Your institution is never identified. Anonymized data improves peer comparison accuracy in your report.</p>
        </div>
      </label>
    </div>
  </>
);

const StepStrategicHorizon = ({ formData: d, update }: { formData: DiscoveryFormData; update: any }) => (
  <>
    <h2 className="text-xl font-bold text-foreground">Step 8: Strategic Horizon</h2>
    <p className="text-sm text-muted-foreground -mt-4">Identifies quick wins and future-readiness indicators.</p>
    <SelectField label="Current SWIFT in-flow translation service status" value={d.swiftTranslationOptInStatus} options={SWIFT_OPT_IN} onChange={v => update('swiftTranslationOptInStatus', v)}
      helper="Institutions still opted in are incurring €0.235 per transaction from January 2026." />
    <SelectField label="November 2026 structured address mandate readiness" value={d.structuredAddressReadiness} options={ADDRESS_READINESS} onChange={v => update('structuredAddressReadiness', v)} />
    <SelectField label="Last SWIFT standards release formally reviewed" value={d.lastSwiftStandardsReview} options={SWIFT_REVIEW} onChange={v => update('lastSwiftStandardsReview', v)} />
    <SelectField label="Primary strategic ambition for payment infrastructure" value={d.strategicAmbition} options={STRATEGIC_AMBITION} onChange={v => update('strategicAmbition', v)} />
    <SelectField label="Assessment scope requested" value={d.reportTypeRequested} options={REPORT_TYPE} onChange={v => update('reportTypeRequested', v)}
      helper="Diagnostic: current state, cost exposure, quick wins. Full Assessment: complete pathway analysis, vendor selection, roadmap." />
  </>
);

const Step9OrgReadiness = ({ formData: d, update }: { formData: DiscoveryFormData; update: any }) => (
  <>
    <h2 className="text-xl font-bold text-foreground">Step 9: Organizational Readiness</h2>
    <div className="grid md:grid-cols-2 gap-4">
      <SelectField label="Executive Sponsorship Level" value={d.executiveSponsorship} options={SPONSORSHIP} onChange={v => update('executiveSponsorship', v)} />
      <RadioField label="Dedicated Project Manager Assigned" value={d.dedicatedPM} options={['Yes', 'No']} onChange={v => update('dedicatedPM', v)} />
      <SelectField label="Change Management Capability" value={d.changeManagement} options={CHANGE_MGMT} onChange={v => update('changeManagement', v)} />
      <RadioField label="Testing Environment Available" value={d.testingEnvironment} options={YES_NO_PARTIAL} onChange={v => update('testingEnvironment', v)} />
      <RadioField label="Rollback Capability in Place" value={d.rollbackCapability} options={YES_NO_PARTIAL} onChange={v => update('rollbackCapability', v)} />
      <SelectField label="Staff Training Status" value={d.staffTraining} options={TRAINING} onChange={v => update('staffTraining', v)} />
    </div>
  </>
);

export default UnifiedDiscoveryTool;
