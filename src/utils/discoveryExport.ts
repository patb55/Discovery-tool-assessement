import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// === Types ===
export interface DiscoveryFormData {
  // Step 1
  institutionName: string;
  institutionType: string;
  totalAssets: string;
  countriesOfOperation: number;
  regions: string[];
  isGlobal: boolean;
  bankingRelationships: string[];
  otherBankingRelationships: string;
  // Step 2
  monthlyVolume: number;
  annualGrowthRate: number;
  crossBorderPercent: number;
  corridors: { currencyPair: string; monthlyVolume: number; volumeShare?: number; enabled?: boolean }[];
  currencyCount: number;
  messageDistribution: { mt103: number; mt202: number; mt900: number; mt910: number; other: number };
  reconciliationComplexity: string;
  // Step 3
  coreSystem: string;
  systemAge: string;
  swiftConnectivity: string;
  messagingFormats: string[];
  isoSendCapable: string;
  isoReceiveCapable: string;
  extendedFieldsCapable: string;
  integrationComplexity: string;
  itTeamSize: string;
  blockchainExperience: boolean;
  // Step 4 - Strategic
  dltStrategyMaturity: string;
  november2026Priority: string;
  enhancedDataMandateReadiness: string;
  primaryComplianceMotivation: string;
  // Step 5 - Budget
  complianceBudget: string;
  urgency: string;
  targetGoLive: string;
  translationFeeTolerance: string;
  vendorSelectionStatus: string;
  // Step 6 - Financial Impact
  nostroRelationshipCount: string;
  nostroBalanceRange: string;
  costOfCapital: string;
  monthlyPaymentRepairVolume: string;
  truncationRejections: string;
  capitalTreatmentAwareness: string;
  digitalAssetExposure: string;
  // Step 7 - Market Context
  institutionClassification: string;
  geographicFootprint: string;
  primaryCorridorRegions: string[];
  boardAwarenessLevel: string;
  peerBenchmarkConsent: boolean;
  // Step 8 - Strategic Horizon
  swiftTranslationOptInStatus: string;
  structuredAddressReadiness: string;
  lastSwiftStandardsReview: string;
  strategicAmbition: string;
  reportTypeRequested: string;
  // Step 9 - Organizational
  executiveSponsorship: string;
  dedicatedPM: string;
  changeManagement: string;
  testingEnvironment: string;
  rollbackCapability: string;
  staffTraining: string;
}

export interface DiscoveryScores {
  overallReadiness: number;
  technicalReadiness: number;
  organizationalReadiness: number;
  riskLevel: string;
}

// === Scoring ===
export const calculateTechnicalReadiness = (d: DiscoveryFormData): number => {
  let score = 0;
  const ageMap: Record<string, number> = { 'Latest version': 20, '1-2 years old': 15, '3-5 years old': 10, '5-10 years old': 5, 'Over 10 years old': 0 };
  score += ageMap[d.systemAge] ?? 0;
  const isoMap: Record<string, number> = { 'Yes': 15, 'Partial': 8, 'In progress': 8, 'No': 0 };
  score += isoMap[d.isoSendCapable] ?? 0;
  score += isoMap[d.isoReceiveCapable] ?? 0;
  const intMap: Record<string, number> = { 'Low': 15, 'Medium': 10, 'High': 5, 'Very High': 0 };
  score += intMap[d.integrationComplexity] ?? 0;
  const teamMap: Record<string, number> = { '26+': 15, '10-25': 15, '10+': 15, '6-10': 12, '6-9': 12, '3-5': 8, '1-2': 4, '0': 0 };
  score += teamMap[d.itTeamSize] ?? 0;
  const extMap: Record<string, number> = { 'Yes': 10, 'Partial': 5, 'No': 0 };
  score += extMap[d.extendedFieldsCapable] ?? 0;
  score += d.messagingFormats.includes('ISO 20022 (MX)') ? 10 : 0;
  return score;
};

export const calculateOrganizationalReadiness = (d: DiscoveryFormData): number => {
  let score = 0;
  const sponsorMap: Record<string, number> = { 'C-suite champion': 25, 'C-level champion': 25, 'Dedicated sponsor': 20, 'Strong commitment': 20, 'Active support': 15, 'Awareness': 5, 'None': 0, 'No sponsorship': 0 };
  score += sponsorMap[d.executiveSponsorship] ?? 0;
  // Safe default: absent/empty dedicatedPM = "No" (0 points), only explicit "Yes" scores
  score += (d.dedicatedPM && d.dedicatedPM === 'Yes') ? 20 : 0;
  const cmMap: Record<string, number> = { 'Strong': 20, 'Moderate': 12, 'Limited': 5, 'None': 0 };
  score += cmMap[d.changeManagement] ?? 0;
  // Safe default: absent/empty testingEnvironment = 0 points
  const testMap: Record<string, number> = { 'Yes': 20, 'Full': 20, 'Partial': 10, 'No': 0, 'None': 0 };
  score += (d.testingEnvironment && testMap[d.testingEnvironment] !== undefined) ? testMap[d.testingEnvironment] : 0;
  // Safe default: absent/empty rollbackCapability = 0 points (not scored but guard anyway)
  const rollbackMap: Record<string, number> = { 'Yes': 10, 'Full': 10, 'Partial': 5, 'No': 0, 'None': 0 };
  score += (d.rollbackCapability && rollbackMap[d.rollbackCapability] !== undefined) ? rollbackMap[d.rollbackCapability] : 0;
  // Safe default: absent/empty staffTraining = 0 points
  const trainMap: Record<string, number> = { 'Complete': 15, 'Completed': 15, 'In progress': 8, 'Planned': 3, 'Not started': 0 };
  score += (d.staffTraining && trainMap[d.staffTraining] !== undefined) ? trainMap[d.staffTraining] : 0;
  return score;
};

export const calculateScores = (d: DiscoveryFormData): DiscoveryScores => {
  const tech = calculateTechnicalReadiness(d);
  const org = calculateOrganizationalReadiness(d);
  const overall = Math.round(tech * 0.6 + org * 0.4);
  let riskLevel = 'LOW';
  if (overall <= 40) riskLevel = 'CRITICAL';
  else if (overall <= 60) riskLevel = 'HIGH';
  else if (overall <= 80) riskLevel = 'MEDIUM';
  return { overallReadiness: overall, technicalReadiness: tech, organizationalReadiness: org, riskLevel };
};

const getRecommendedPathway = (d: DiscoveryFormData, scores: DiscoveryScores): string => {
  const dltActive = d.dltStrategyMaturity && d.dltStrategyMaturity !== 'Not exploring' && d.dltStrategyMaturity !== 'No interest currently' && d.dltStrategyMaturity !== 'Monitoring developments';
  if (d.blockchainExperience && dltActive) return 'Hybrid';
  if (d.blockchainExperience) return 'DLT';
  return 'Traditional';
};

const getTopFindings = (d: DiscoveryFormData, scores: DiscoveryScores): string[] => {
  const findings: string[] = [];
  if (d.isoSendCapable === 'No') findings.push('ISO 20022 send capability not yet implemented — critical gap for November 2025 deadline.');
  if (d.isoReceiveCapable === 'No') findings.push('ISO 20022 receive capability missing — risk of rejected incoming payments.');
  if (scores.organizationalReadiness < 40) findings.push('Organizational readiness is critically low — executive sponsorship and change management need urgent attention.');
  if (d.systemAge === 'Over 10 years old' || d.systemAge === '5-10 years old') findings.push('Core banking system age poses significant upgrade complexity.');
  if (d.integrationComplexity === 'Very High' || d.integrationComplexity === 'High') findings.push('High integration complexity will require extended testing and parallel-run periods.');
  if (d.extendedFieldsCapable === 'No') findings.push('Extended data fields not supported — structured address mandate by November 2026 at risk.');
  return findings.slice(0, 3);
};

const formatDate = (): string => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const getFileSafeDate = (): string => new Date().toISOString().split('T')[0];
const getFileSafeName = (name: string): string => (name || 'Discovery').replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);

const formatNumber = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// === Export Normalisation Helpers ===
const exportSwiftOptIn = (v: string): string => {
  if (v?.toLowerCase().includes('opted in') && !v.includes('('))
    return 'Opted in (using translation)';
  if (v?.toLowerCase().includes('opted out') && !v.includes('('))
    return 'Opted out (fully MX)';
  return v || '';
};

const exportItTeamSize = (v: string): string => {
  if (!v) return '0';
  // Already a bucket label — pass through
  if (['0', '1-2', '3-5', '6-9', '6-10', '10-25', '10+', '26+'].includes(v)) return v;
  // Raw number — bucket it
  const n = parseInt(v, 10);
  if (isNaN(n)) return v;
  if (n === 0) return '0';
  if (n <= 2) return '1-2';
  if (n <= 5) return '3-5';
  if (n <= 9) return '6-9';
  if (n <= 25) return '10-25';
  return '26+';
};

// === JSON Export ===
export const generateDiscoveryJSON = (d: DiscoveryFormData): void => {
  const scores = calculateScores(d);
  const translationCostPerTx = 0.235;
  const estimatedMonthlyCost = d.monthlyVolume * (d.crossBorderPercent / 100) * translationCostPerTx;

  const output = {
    assessmentType: 'unified-discovery-v1',
    assessmentDate: new Date().toISOString(),
    institutionProfile: {
      name: d.institutionName,
      type: d.institutionType,
      assetSize: d.totalAssets,
      countries: d.countriesOfOperation,
      regions: d.regions,
      isGlobal: d.isGlobal,
      bankingRelationships: d.bankingRelationships.length > 0 ? d.bankingRelationships : [],
      otherBankingRelationships: d.otherBankingRelationships || null
    },
    transactionProfile: {
      monthlyVolume: d.monthlyVolume,
      annualGrowthRate: d.annualGrowthRate,
      crossBorderPercent: d.crossBorderPercent,
      corridors: d.corridors.filter(c => c.currencyPair).map(c => ({
        currencyPair: c.currencyPair,
        monthlyVolume: c.monthlyVolume,
        ...(c.volumeShare !== undefined && { volumeShare: c.volumeShare }),
        ...(c.enabled !== undefined && { enabled: c.enabled }),
      })),
      currencyCount: d.currencyCount,
      messageDistribution: d.messageDistribution,
      reconciliationComplexity: d.reconciliationComplexity
    },
    technicalProfile: {
      coreSystem: d.coreSystem,
      systemAge: d.systemAge,
      swiftConnectivity: d.swiftConnectivity,
      messagingFormats: d.messagingFormats,
      isoSendCapable: d.isoSendCapable,
      isoReceiveCapable: d.isoReceiveCapable,
      extendedFieldsCapable: d.extendedFieldsCapable,
      integrationComplexity: d.integrationComplexity,
      itTeamSize: exportItTeamSize(d.itTeamSize),
      blockchainExperience: d.blockchainExperience
    },
    strategicProfile: {
      dltStrategyMaturity: d.dltStrategyMaturity,
      november2026Priority: d.november2026Priority,
      enhancedDataMandateReadiness: d.enhancedDataMandateReadiness,
      primaryComplianceMotivation: d.primaryComplianceMotivation
    },
    budgetProfile: {
      complianceBudget: d.complianceBudget,
      urgency: d.urgency,
      targetGoLive: d.targetGoLive,
      translationFeeTolerance: d.translationFeeTolerance,
      vendorSelectionStatus: d.vendorSelectionStatus
    },
    financialImpactProfile: {
      nostroRelationshipCount: d.nostroRelationshipCount,
      nostroBalanceRange: d.nostroBalanceRange,
      costOfCapital: d.costOfCapital,
      monthlyPaymentRepairVolume: d.monthlyPaymentRepairVolume,
      truncationRejections: d.truncationRejections,
      capitalTreatmentAwareness: d.capitalTreatmentAwareness,
      digitalAssetExposure: d.digitalAssetExposure
    },
    marketContextProfile: {
      institutionClassification: d.institutionClassification,
      geographicFootprint: d.geographicFootprint,
      primaryCorridorRegions: d.primaryCorridorRegions,
      boardAwarenessLevel: d.boardAwarenessLevel,
      peerBenchmarkConsent: d.peerBenchmarkConsent
    },
    strategicHorizonProfile: {
      swiftTranslationOptInStatus: exportSwiftOptIn(d.swiftTranslationOptInStatus),
      structuredAddressReadiness: d.structuredAddressReadiness,
      lastSwiftStandardsReview: d.lastSwiftStandardsReview,
      strategicAmbition: d.strategicAmbition,
      reportTypeRequested: d.reportTypeRequested
    },
    organizationalProfile: {
      executiveSponsorship: d.executiveSponsorship,
      dedicatedPM: d.dedicatedPM,
      changeManagement: d.changeManagement,
      testingEnvironment: d.testingEnvironment,
      rollbackCapability: d.rollbackCapability,
      staffTraining: d.staffTraining
    },
    scores,
    estimatedMonthlyTranslationCost: Math.round(estimatedMonthlyCost)
  };

  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Discovery-${getFileSafeName(d.institutionName)}-${getFileSafeDate()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// === PDF Export ===
export const generateDiscoveryPDF = (d: DiscoveryFormData): void => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 20;
  let y = 0;
  const scores = calculateScores(d);
  const pathway = getRecommendedPathway(d, scores);
  const findings = getTopFindings(d, scores);
  const translationCostPerTx = 0.235;
  const estimatedMonthlyCost = d.monthlyVolume * (d.crossBorderPercent / 100) * translationCostPerTx;
  const totalPages = 4;

  const addFooter = (pageNum: number) => {
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${pageNum} of ${totalPages}`, pw - m, ph - 10, { align: 'right' });
    doc.text(`Prepared by: Patrick Bayce-Chalvin | ${formatDate()}`, pw / 2, ph - 10, { align: 'center' });
  };

  // ========== PAGE 1: Executive Summary ==========
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pw, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ISO 20022 Unified Discovery', pw / 2, 18, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Assessment Report', pw / 2, 28, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprehensive Readiness Evaluation', pw / 2, 38, { align: 'center' });

  y = 58;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Institution:', m, y);
  doc.setFont('helvetica', 'normal');
  doc.text(d.institutionName || 'Not Specified', m + 30, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', m, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(), m + 18, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Type:', m, y);
  doc.setFont('helvetica', 'normal');
  doc.text(d.institutionType || 'N/A', m + 18, y);

  // Banking Relationships
  if (d.bankingRelationships && d.bankingRelationships.length > 0) {
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Banking Relationships:', m, y);
    doc.setFont('helvetica', 'normal');
    const allBanks = [...d.bankingRelationships];
    if (d.otherBankingRelationships) allBanks.push(d.otherBankingRelationships);
    const bankText = allBanks.join(', ');
    const bankLines = doc.splitTextToSize(bankText, pw - 2 * m - 50);
    doc.text(bankLines, m + 52, y);
    y += Math.max(7, bankLines.length * 5);
  }

  y += 15;
  const scoreColor = scores.overallReadiness >= 81 ? [34, 197, 94] : scores.overallReadiness >= 61 ? [251, 188, 4] : scores.overallReadiness >= 41 ? [234, 150, 50] : [234, 67, 53];
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(m, y, 70, 40, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(`${scores.overallReadiness}/100`, m + 35, y + 18, { align: 'center' });
  doc.setFontSize(10);
  doc.text('OVERALL READINESS', m + 35, y + 30, { align: 'center' });

  const colX = m + 80;
  const colW = (pw - colX - m) / 3;
  [
    { label: 'Technical', value: scores.technicalReadiness },
    { label: 'Organizational', value: scores.organizationalReadiness },
    { label: 'Risk Level', value: scores.riskLevel as any }
  ].forEach((item, i) => {
    const x = colX + i * colW;
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(x, y, colW - 4, 40, 3, 3, 'F');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, x + (colW - 4) / 2, y + 10, { align: 'center' });
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const val = typeof item.value === 'number' ? `${item.value}` : item.value;
    doc.text(val, x + (colW - 4) / 2, y + 28, { align: 'center' });
  });

  y += 50;
  const riskColors: Record<string, number[]> = { LOW: [34, 197, 94], MEDIUM: [251, 188, 4], HIGH: [234, 150, 50], CRITICAL: [234, 67, 53] };
  const rc = riskColors[scores.riskLevel] || [128, 128, 128];
  doc.setFillColor(rc[0], rc[1], rc[2]);
  doc.roundedRect(m, y, 40, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(scores.riskLevel, m + 20, y + 8, { align: 'center' });
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Recommended Pathway: ${pathway}`, m + 48, y + 8);

  y += 22;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Top Findings', m, y);
  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  if (findings.length === 0) {
    doc.text('No critical findings — institution appears well prepared.', m + 5, y);
  } else {
    findings.forEach((f, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${f}`, pw - 2 * m - 10);
      doc.text(lines, m + 5, y);
      y += lines.length * 5 + 3;
    });
  }

  addFooter(1);

  // ========== PAGE 2: Technical & Transaction Profile ==========
  doc.addPage();
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pw, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Technical & Transaction Profile', pw / 2, 13, { align: 'center' });

  autoTable(doc, {
    startY: 28,
    head: [['Parameter', 'Value']],
    body: [
      ['Core Banking System', d.coreSystem || 'N/A'],
      ['System Age', d.systemAge || 'N/A'],
      ['SWIFT Connectivity', d.swiftConnectivity || 'N/A'],
      ['Messaging Formats', d.messagingFormats.join(', ') || 'N/A'],
      ['ISO 20022 Send', d.isoSendCapable || 'N/A'],
      ['ISO 20022 Receive', d.isoReceiveCapable || 'N/A'],
      ['Extended Data Fields', d.extendedFieldsCapable || 'N/A'],
      ['Integration Complexity', d.integrationComplexity || 'N/A'],
      ['IT Team Size', d.itTeamSize || 'N/A'],
      ['DLT/Blockchain Exp.', d.blockchainExperience ? 'Yes' : 'No'],
    ],
    margin: { left: m, right: m },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
    columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' } }
  });

  let tableEnd = (doc as any).lastAutoTable?.finalY || 120;

  y = tableEnd + 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Transaction Volume Summary', m, y);

  const volData = [
    ['Monthly Volume', d.monthlyVolume ? formatNumber(d.monthlyVolume) : 'N/A'],
    ['Annual Growth Rate', `${d.annualGrowthRate || 0}%`],
    ['Cross-Border %', `${d.crossBorderPercent || 0}%`],
    ['Currencies Handled', `${d.currencyCount || 0}`],
    ['Reconciliation Complexity', d.reconciliationComplexity || 'N/A'],
  ];
  autoTable(doc, {
    startY: y + 5,
    body: volData,
    margin: { left: m, right: m },
    bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
    columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' } },
    theme: 'plain',
    styles: { cellPadding: 2 }
  });

  tableEnd = (doc as any).lastAutoTable?.finalY || y + 50;
  const validCorridors = d.corridors.filter(c => c.currencyPair);
  if (validCorridors.length > 0) {
    y = tableEnd + 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Corridors', m, y);
    autoTable(doc, {
      startY: y + 4,
      head: [['Currency Pair', 'Monthly Volume']],
      body: validCorridors.map(c => [c.currencyPair, formatNumber(c.monthlyVolume)]),
      margin: { left: m, right: m },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 1: { halign: 'right' } }
    });
  }

  tableEnd = (doc as any).lastAutoTable?.finalY || y + 30;
  y = tableEnd + 10;
  if (y < ph - 40) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Enhanced Data Mandate Status', m, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(d.enhancedDataMandateReadiness || 'Not specified', m + 5, y);
  }

  y += 12;
  if (y < ph - 50) {
    const gaps: string[][] = [];
    if (d.isoSendCapable === 'No') gaps.push(['CRITICAL', 'ISO 20022 Send', 'Cannot send compliant messages']);
    if (d.isoReceiveCapable === 'No') gaps.push(['HIGH', 'ISO 20022 Receive', 'Cannot receive compliant messages']);
    if (d.extendedFieldsCapable === 'No') gaps.push(['HIGH', 'Extended Fields', 'Structured address mandate at risk']);
    if (d.integrationComplexity === 'Very High') gaps.push(['MEDIUM', 'Integration', 'Very high complexity adds risk']);
    if (gaps.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text('Critical Technical Gaps', m, y);
      autoTable(doc, {
        startY: y + 4,
        head: [['Priority', 'Area', 'Detail']],
        body: gaps,
        margin: { left: m, right: m },
        headStyles: { fillColor: [234, 67, 53], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        didParseCell: (data) => {
          if (data.column.index === 0 && data.section === 'body') {
            const p = data.cell.raw as string;
            if (p === 'CRITICAL') { data.cell.styles.fillColor = [254, 226, 226]; data.cell.styles.textColor = [185, 28, 28]; }
            else if (p === 'HIGH') { data.cell.styles.fillColor = [255, 237, 213]; data.cell.styles.textColor = [194, 65, 12]; }
            else { data.cell.styles.fillColor = [254, 249, 195]; data.cell.styles.textColor = [161, 98, 7]; }
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });
    }
  }
  addFooter(2);

  // ========== PAGE 3: Strategic & Organizational Profile ==========
  doc.addPage();
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pw, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Strategic & Organizational Profile', pw / 2, 13, { align: 'center' });

  y = 30;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Budget & Timeline', m, y);

  autoTable(doc, {
    startY: y + 5,
    body: [
      ['Compliance Budget', d.complianceBudget || 'N/A'],
      ['Implementation Urgency', d.urgency || 'N/A'],
      ['Target Go-Live', d.targetGoLive || 'Not set'],
      ['Translation Fee Tolerance', d.translationFeeTolerance || 'N/A'],
      ['Vendor Selection Status', d.vendorSelectionStatus || 'N/A'],
    ],
    margin: { left: m, right: m },
    bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
    columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' } },
    theme: 'plain',
    styles: { cellPadding: 2 }
  });
  tableEnd = (doc as any).lastAutoTable?.finalY || y + 50;

  // DLT Strategy flag (replaces old CBDC flag)
  const dltActive = d.dltStrategyMaturity && d.dltStrategyMaturity !== 'Not exploring' && d.dltStrategyMaturity !== 'No interest currently';
  if (dltActive) {
    y = tableEnd + 8;
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(m, y, pw - 2 * m, 16, 3, 3, 'F');
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`DLT / Tokenized Settlement Strategy: ${d.dltStrategyMaturity}`, m + 8, y + 10);
    tableEnd = y + 20;
  }

  // Org readiness breakdown
  y = tableEnd + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Organizational Readiness Breakdown', m, y);

  autoTable(doc, {
    startY: y + 5,
    body: [
      ['Executive Sponsorship', d.executiveSponsorship || 'N/A'],
      ['Dedicated Project Manager', d.dedicatedPM || 'N/A'],
      ['Change Management', d.changeManagement || 'N/A'],
      ['Testing Environment', d.testingEnvironment || 'N/A'],
      ['Rollback Capability', d.rollbackCapability || 'N/A'],
      ['Staff Training', d.staffTraining || 'N/A'],
    ],
    margin: { left: m, right: m },
    bodyStyles: { fontSize: 9, textColor: [60, 60, 60] },
    columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' } },
    theme: 'plain',
    styles: { cellPadding: 2 }
  });
  tableEnd = (doc as any).lastAutoTable?.finalY || y + 60;

  // Key risks
  y = tableEnd + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Risks & Dependencies', m, y);
  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const risks: string[] = [];
  if (d.executiveSponsorship === 'None' || d.executiveSponsorship === 'Awareness') risks.push('Insufficient executive sponsorship may delay decision-making and resource allocation.');
  if (d.dedicatedPM === 'No') risks.push('No dedicated project manager increases risk of scope creep and missed deadlines.');
  if (d.testingEnvironment === 'No') risks.push('No testing environment — production risk during migration.');
  if (d.rollbackCapability === 'No') risks.push('No rollback capability — cannot revert if migration fails.');
  if (d.vendorSelectionStatus === 'Not started') risks.push('Vendor selection not started — timeline may slip.');
  if (risks.length === 0) risks.push('No critical risks identified at this stage.');
  risks.forEach(r => {
    const lines = doc.splitTextToSize(`• ${r}`, pw - 2 * m - 5);
    doc.text(lines, m + 5, y);
    y += lines.length * 5 + 2;
  });

  addFooter(3);

  // ========== PAGE 4: Recommended Next Steps ==========
  doc.addPage();
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pw, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommended Next Steps', pw / 2, 13, { align: 'center' });

  const urgencyScale: Record<string, string[]> = {
    'Immediate (started)': ['Weeks 1-2', 'Weeks 3-4', 'Months 2-3', 'Months 3-4', 'Month 5'],
    'Standard (6-12 months)': ['Months 1-2', 'Months 3-4', 'Months 5-7', 'Months 8-9', 'Months 10-12'],
    'Planned (12-18 months)': ['Months 1-3', 'Months 4-6', 'Months 7-10', 'Months 11-14', 'Months 15-18'],
    'Flexible (18+ months)': ['Months 1-4', 'Months 5-8', 'Months 9-14', 'Months 15-20', 'Months 21-24'],
  };
  const timeline = urgencyScale[d.urgency] || urgencyScale['Standard (6-12 months)'];

  const phases = [
    { phase: 'Phase 1: Assessment & Planning', timeline: timeline[0], actions: ['Complete vendor engagement & gap analysis', 'Secure budget approvals', 'Establish project governance', 'Define success criteria'] },
    { phase: 'Phase 2: Technical Discovery', timeline: timeline[1], actions: ['Map current message flows', 'Identify integration dependencies', 'Assess data quality for structured addresses', 'Set up testing environment'] },
    { phase: 'Phase 3: Development & Config', timeline: timeline[2], actions: ['Configure ISO 20022 mappings', 'Build integration components', 'Train technical staff', 'Execute unit testing'] },
    { phase: 'Phase 4: Pilot & Parallel Run', timeline: timeline[3], actions: ['Limited production deployment', 'Run parallel with legacy formats', 'Monitor & resolve issues', 'Validate rollback procedures'] },
    { phase: 'Phase 5: Full Rollout', timeline: timeline[4], actions: ['Full production deployment', 'Decommission legacy formats', 'Complete staff training', 'Establish ongoing monitoring'] },
  ];

  y = 30;
  phases.forEach((p, i) => {
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(m, y, pw - 2 * m, 36, 3, 3, 'F');
    doc.setFillColor(59, 130, 246);
    doc.circle(m + 8, y + 8, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(String(i + 1), m + 8, y + 10, { align: 'center' });
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.text(p.phase, m + 18, y + 10);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(p.timeline, pw - m - 5, y + 10, { align: 'right' });
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    p.actions.forEach((a, ai) => {
      doc.text(`• ${a}`, m + 18, y + 17 + ai * 4.5);
    });
    y += 39;
  });

  // Translation cost impact
  y += 3;
  doc.setFillColor(255, 250, 230);
  doc.roundedRect(m, y, pw - 2 * m, 20, 3, 3, 'F');
  doc.setTextColor(161, 98, 7);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Estimated Monthly Translation Cost Impact', m + 8, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${formatNumber(d.monthlyVolume)} msgs x ${d.crossBorderPercent}% cross-border x EUR 0.235/tx = EUR ${formatNumber(Math.round(estimatedMonthlyCost))}/month`, m + 8, y + 17);

  // CTA
  y += 24;
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(m, y, pw - 2 * m, 25, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Schedule your full ISO 20022 pathway analysis', pw / 2, y + 10, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Contact: patrick@bayce-chalvin.com | www.bayce-chalvin.com', pw / 2, y + 19, { align: 'center' });

  addFooter(4);

  doc.save(`Discovery-${getFileSafeName(d.institutionName)}-${getFileSafeDate()}.pdf`);
};
