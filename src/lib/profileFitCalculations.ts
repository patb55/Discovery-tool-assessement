// profileFitCalculations.ts — Extract discovery data for profile-fit scoring

export interface DiscoveryInputs {
  institutionProfile?: {
    totalAssets?: string;
    institutionType?: string;
    countriesOfOperation?: number;
    regions?: string[];
  };
  technicalProfile?: {
    isoSendCapable?: string;
    isoReceiveCapable?: string;
    blockchainExperience?: boolean;
    itTeamSize?: string;
  };
  strategicProfile?: {
    dltStrategyMaturity?: string;
  };
  budgetProfile?: {
    urgency?: string;
  };
  transactionProfile?: {
    monthlyVolume?: number;
    crossBorderPercentage?: number;
  };
}

export interface ExtractedDiscoveryData {
  totalAssets: string;
  institutionType: string;
  countriesOfOperation: number;
  regions: string[];
  isoCapability: 'none' | 'partial' | 'full_mx';
  dltExperience: 'none' | 'piloting' | 'extensive';
  urgency: 'immediate' | 'standard' | 'flexible';
  monthlyVolume: number;
  crossBorderPercentage: number;
  itTeamSize: string;
}

/**
 * Extracts and normalises discovery data for profile-fit calculations.
 *
 * @param inputs  Structured form-state object (may have nested sub-objects)
 * @param importedData  Optional pre-mapped object (same shape as inputs)
 * @param rawJson  Optional raw imported JSON — used to resolve field-path
 *                 mismatches between the JSON schema and the form state
 */
export function extractDiscoveryData(
  inputs: DiscoveryInputs,
  importedData?: DiscoveryInputs,
  rawJson?: Record<string, any>,
): ExtractedDiscoveryData {
  const src = importedData || inputs;

  // --- Fix 1: DLT strategy maturity lives in strategicProfile, not technicalCapabilities ---
  const dltMaturityRaw: string =
    rawJson?.strategicProfile?.dltStrategyMaturity ??
    rawJson?.strategicOrientation?.dltMaturity ??
    src.strategicProfile?.dltStrategyMaturity ??
    '';

  // --- Fix 4: Derive dltExperience from the maturity string ---
  const dltMaturityLower = dltMaturityRaw.toLowerCase();
  let dltExperience: 'none' | 'piloting' | 'extensive' = 'none';
  if (
    dltMaturityLower.includes('operational') ||
    dltMaturityLower.includes('production') ||
    dltMaturityLower.includes('extensive')
  ) {
    dltExperience = 'extensive';
  } else if (
    dltMaturityLower.includes('pilot') ||
    dltMaturityLower.includes('evaluating') ||
    dltMaturityLower.includes('monitoring') ||
    src.technicalProfile?.blockchainExperience === true
  ) {
    dltExperience = 'piloting';
  }

  // --- Fix 2: ISO capability — derive from isoSendCapable + isoReceiveCapable ---
  const isoSend =
    rawJson?.technicalProfile?.isoSendCapable ??
    rawJson?.technicalInfrastructure?.iso20022SendCapability ??
    src.technicalProfile?.isoSendCapable ??
    '';
  const isoReceive =
    rawJson?.technicalProfile?.isoReceiveCapable ??
    rawJson?.technicalInfrastructure?.iso20022ReceiveCapability ??
    src.technicalProfile?.isoReceiveCapable ??
    '';

  let isoCapability: 'none' | 'partial' | 'full_mx' = 'partial';
  if (isoSend === 'Yes' && isoReceive === 'Yes') {
    isoCapability = 'full_mx';
  } else if (isoSend === 'No' && isoReceive === 'No') {
    isoCapability = 'none';
  }

  // --- Fix 3: Urgency enum — map long strings to short enum ---
  const rawUrgency: string =
    rawJson?.budgetProfile?.urgency ??
    rawJson?.budgetTimeline?.implementationUrgency ??
    src.budgetProfile?.urgency ??
    '';
  const urgencyLower = rawUrgency.toLowerCase();
  let urgency: 'immediate' | 'standard' | 'flexible' = 'standard';
  if (urgencyLower.includes('immediate') || urgencyLower.includes('0-6')) {
    urgency = 'immediate';
  } else if (urgencyLower.includes('flexible') || urgencyLower.includes('12+')) {
    urgency = 'flexible';
  }

  return {
    totalAssets: src.institutionProfile?.totalAssets ?? '',
    institutionType: src.institutionProfile?.institutionType ?? '',
    countriesOfOperation: src.institutionProfile?.countriesOfOperation ?? 1,
    regions: src.institutionProfile?.regions ?? [],
    isoCapability,
    dltExperience,
    urgency,
    monthlyVolume: src.transactionProfile?.monthlyVolume ?? 0,
    crossBorderPercentage: src.transactionProfile?.crossBorderPercentage ?? 0,
    itTeamSize: src.technicalProfile?.itTeamSize ?? '0',
  };
}
