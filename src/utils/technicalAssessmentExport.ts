import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FormData {
  institutionName: string;
  coreBankingSystem: string;
  systemVersion: string;
  paymentGateway: string;
  currentMessageFormat: string;
  systemAge: string;
  lastUpgrade: string;
  connectedSystems: string;
  canReceiveISO: string;
  canSendISO: string;
  supportsExtendedFields: string;
  processingType: string;
  updateFrequency: string;
  deploymentType: string;
  itTeamSize: string;
  technicalExpertise: string;
  upgradeBudget: string;
  acceptableDowntime: string;
  messageCompatibility: string;
  dataFieldMapping: string;
  testingEnvironment: string;
  rollbackCapability: string;
  monitoringAlerting: string;
}

interface Gap {
  priority: string;
  gap: string;
  impact: string;
  action: string;
}

interface Recommendation {
  phase: string;
  actions: string[];
}

interface Strategy {
  strategy: string;
  description: string;
  timeline: string;
  estimatedCost: string;
  risk: string;
}

interface Report {
  readiness: number;
  strategy: Strategy;
  criticalGaps: Gap[];
  recommendations: Recommendation[];
}

const formatDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getFileSafeDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getFileSafeName = (name: string): string => {
  return (name || 'Assessment').replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
};

export const generatePDFReport = (formData: FormData, report: Report): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = 0;

  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.text(`Prepared by: Patrick Bayce-Chalvin | ${formatDate()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  };

  // === PAGE 1: Header & Overview ===
  // Blue header bar
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ISO 20022 Technical Requirements', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Assessment Report', pageWidth / 2, 28, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Infrastructure Evaluation Report', pageWidth / 2, 38, { align: 'center' });

  // Institution info
  yPos = 60;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Institution:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formData.institutionName || 'Not Specified', margin + 30, yPos);

  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Assessment Date:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(), margin + 45, yPos);

  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Core Banking System:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formData.coreBankingSystem || 'Not Specified'} ${formData.systemVersion ? `(v${formData.systemVersion})` : ''}`, margin + 55, yPos);

  // Readiness Score Section
  yPos += 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Technical Readiness Score', margin, yPos);

  yPos += 10;
  const scoreWidth = 80;
  const scoreHeight = 40;
  const scoreX = margin;

  // Score background based on readiness
  if (report.readiness >= 70) {
    doc.setFillColor(34, 197, 94); // Green
  } else if (report.readiness >= 40) {
    doc.setFillColor(251, 188, 4); // Yellow
  } else {
    doc.setFillColor(234, 67, 53); // Red
  }
  doc.roundedRect(scoreX, yPos, scoreWidth, scoreHeight, 4, 4, 'F');

  // Score text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(`${report.readiness}/100`, scoreX + scoreWidth / 2, yPos + 18, { align: 'center' });
  doc.setFontSize(10);
  doc.text(
    report.readiness >= 70 ? 'WELL PREPARED' : report.readiness >= 40 ? 'MODERATE RISK' : 'HIGH RISK',
    scoreX + scoreWidth / 2,
    yPos + 30,
    { align: 'center' }
  );

  // Risk summary box
  const summaryX = scoreX + scoreWidth + 15;
  doc.setFillColor(240, 245, 255);
  doc.roundedRect(summaryX, yPos, pageWidth - summaryX - margin, scoreHeight, 4, 4, 'F');

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryLines = [
    `System Age: ${formData.systemAge || 'N/A'} years`,
    `Deployment: ${formData.deploymentType || 'Not specified'}`,
    `IT Team Size: ${formData.itTeamSize || 'N/A'} staff`,
    `Budget: ${formData.upgradeBudget || 'Not specified'}`
  ];
  summaryLines.forEach((line, i) => {
    doc.text(line, summaryX + 5, yPos + 10 + i * 8);
  });

  // === PAGE 2: Upgrade Strategy ===
  doc.addPage();

  // Section title
  yPos = 25;
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommended Upgrade Strategy', pageWidth / 2, 13, { align: 'center' });

  yPos = 35;
  doc.setTextColor(40, 40, 40);

  // Strategy card
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 70, 4, 4, 'F');

  yPos += 12;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(report.strategy.strategy, margin + 10, yPos);

  // Risk badge
  const riskColor = report.strategy.risk === 'LOW' ? [34, 197, 94] : 
                    report.strategy.risk === 'MEDIUM' ? [251, 188, 4] : 
                    [234, 67, 53];
  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  const riskBadgeX = pageWidth - margin - 35;
  doc.roundedRect(riskBadgeX, yPos - 8, 30, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(report.strategy.risk, riskBadgeX + 15, yPos - 1, { align: 'center' });

  yPos += 12;
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const descLines = doc.splitTextToSize(report.strategy.description, pageWidth - 2 * margin - 20);
  doc.text(descLines, margin + 10, yPos);

  yPos += descLines.length * 5 + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Timeline:', margin + 10, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(report.strategy.timeline, margin + 35, yPos);

  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Estimated Cost:', margin + 10, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(report.strategy.estimatedCost, margin + 50, yPos);

  // === Critical Gaps Table ===
  yPos += 25;
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Critical Gaps Identified', margin, yPos);

  if (report.criticalGaps.length > 0) {
    const gapsData = report.criticalGaps.map(gap => [
      gap.priority,
      gap.gap,
      gap.impact,
      gap.action
    ]);

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Priority', 'Gap', 'Impact', 'Recommended Action']],
      body: gapsData,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [60, 60, 60]
      },
      columnStyles: {
        0: { cellWidth: 22, halign: 'center' },
        1: { cellWidth: 40 },
        2: { cellWidth: 50 },
        3: { cellWidth: 58 }
      },
      didParseCell: (data) => {
        if (data.column.index === 0 && data.section === 'body') {
          const priority = data.cell.raw as string;
          if (priority === 'CRITICAL') {
            data.cell.styles.fillColor = [254, 226, 226];
            data.cell.styles.textColor = [185, 28, 28];
          } else if (priority === 'HIGH') {
            data.cell.styles.fillColor = [255, 237, 213];
            data.cell.styles.textColor = [194, 65, 12];
          } else {
            data.cell.styles.fillColor = [254, 249, 195];
            data.cell.styles.textColor = [161, 98, 7];
          }
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
  } else {
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('No critical gaps identified - your systems are well prepared!', margin, yPos);
  }

  // === PAGE 3: Implementation Roadmap ===
  doc.addPage();

  yPos = 25;
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Implementation Roadmap', pageWidth / 2, 13, { align: 'center' });

  // 5-Phase Timeline
  const phases = [
    {
      phase: 'Phase 1: Vendor Selection & Contract',
      timeline: 'Months 1-2',
      actions: [
        'Complete detailed system inventory',
        'Engage with current vendor about ISO 20022 roadmap',
        'Finalize vendor contracts and SLAs',
        'Establish project governance'
      ]
    },
    {
      phase: 'Phase 2: Technical Discovery',
      timeline: 'Months 3-4',
      actions: [
        'Document current process flows',
        'Identify integration points',
        'Assess data migration requirements',
        'Establish testing environment'
      ]
    },
    {
      phase: 'Phase 3: Development & Testing',
      timeline: 'Months 5-7',
      actions: [
        'Configure message format mappings',
        'Develop integration components',
        'Execute unit and integration testing',
        'Train technical staff'
      ]
    },
    {
      phase: 'Phase 4: Pilot Launch',
      timeline: 'Months 8-9',
      actions: [
        'Limited production deployment',
        'Parallel run with legacy formats',
        'Monitor and resolve issues',
        'Refine rollback procedures'
      ]
    },
    {
      phase: 'Phase 5: Full Rollout',
      timeline: 'Months 10-12',
      actions: [
        'Full production deployment',
        'Decommission legacy formats',
        'Complete staff training',
        'Establish ongoing monitoring'
      ]
    }
  ];

  yPos = 35;
  phases.forEach((phase, index) => {
    // Phase header
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 42, 3, 3, 'F');

    // Phase indicator circle
    doc.setFillColor(59, 130, 246);
    doc.circle(margin + 8, yPos + 8, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(String(index + 1), margin + 8, yPos + 10, { align: 'center' });

    // Phase title and timeline
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(phase.phase, margin + 18, yPos + 10);
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(phase.timeline, pageWidth - margin - 5, yPos + 10, { align: 'right' });

    // Actions
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    phase.actions.forEach((action, actionIndex) => {
      doc.text(`• ${action}`, margin + 18, yPos + 18 + actionIndex * 6);
    });

    yPos += 48;
  });

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  // Save the PDF
  const fileName = `ISO20022-Technical-Assessment-${getFileSafeName(formData.institutionName)}-${getFileSafeDate()}.pdf`;
  doc.save(fileName);
};

export const generateJSONExport = (formData: FormData, report: Report): void => {
  const exportData = {
    assessmentDate: new Date().toISOString(),
    
    institutionProfile: {
      institutionName: formData.institutionName || '',
      coreBankingSystem: formData.coreBankingSystem || '',
      systemVersion: formData.systemVersion || '',
      paymentGateway: formData.paymentGateway || '',
      currentMessageFormat: formData.currentMessageFormat || '',
      systemAge: parseInt(formData.systemAge) || 0,
      lastUpgrade: formData.lastUpgrade || '',
      connectedSystems: parseInt(formData.connectedSystems) || 0
    },
    
    technicalCapabilities: {
      canReceiveISO: formData.canReceiveISO === 'yes',
      canSendISO: formData.canSendISO === 'yes',
      supportsExtendedFields: formData.supportsExtendedFields === 'yes',
      processingType: formData.processingType || '',
      updateFrequency: formData.updateFrequency || ''
    },
    
    infrastructure: {
      deploymentType: formData.deploymentType || '',
      itTeamSize: parseInt(formData.itTeamSize) || 0,
      technicalExpertise: parseInt(formData.technicalExpertise) || 0,
      upgradeBudget: formData.upgradeBudget || '',
      acceptableDowntime: formData.acceptableDowntime || ''
    },
    
    complianceReadiness: {
      messageCompatibility: formData.messageCompatibility || '',
      dataFieldMapping: formData.dataFieldMapping || '',
      testingEnvironment: formData.testingEnvironment === 'yes',
      rollbackCapability: formData.rollbackCapability === 'yes',
      monitoringAlerting: formData.monitoringAlerting || ''
    },
    
    analysisResults: {
      readinessScore: report.readiness,
      upgradeStrategy: {
        strategy: report.strategy.strategy,
        description: report.strategy.description,
        timeline: report.strategy.timeline,
        estimatedCost: report.strategy.estimatedCost,
        risk: report.strategy.risk as 'LOW' | 'MEDIUM' | 'HIGH'
      },
      criticalGaps: report.criticalGaps.map(gap => ({
        priority: gap.priority as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
        gap: gap.gap,
        impact: gap.impact,
        action: gap.action
      })),
      recommendations: report.recommendations.map(rec => ({
        phase: rec.phase,
        actions: rec.actions
      }))
    }
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ISO20022-Technical-Data-${getFileSafeName(formData.institutionName)}-${getFileSafeDate()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
