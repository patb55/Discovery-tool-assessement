import { useState } from 'react';
import { ChevronRight, ChevronLeft, Download, CheckCircle, AlertCircle } from 'lucide-react';
import logo from '@/assets/PBC-Logo-Circuit.svg';

const TechnicalRequirementsAssessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Section 1: Current Systems
    institutionName: '',
    coreBankingSystem: '',
    systemVersion: '',
    paymentGateway: '',
    currentMessageFormat: '',
    systemAge: '',
    lastUpgrade: '',
    connectedSystems: '',
    
    // Section 2: Technical Capabilities
    canReceiveISO: '',
    canSendISO: '',
    supportsExtendedFields: '',
    processingType: '',
    updateFrequency: '',
    
    // Section 3: Infrastructure
    deploymentType: '',
    itTeamSize: '',
    technicalExpertise: '',
    upgradeBudget: '',
    acceptableDowntime: '',
    
    // Section 4: Compliance Status
    messageCompatibility: '',
    dataFieldMapping: '',
    testingEnvironment: '',
    rollbackCapability: '',
    monitoringAlerting: ''
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateReadiness = () => {
    let score = 0;
    let maxScore = 0;

    // Technical capability scoring
    if (formData.canReceiveISO === 'yes') score += 20;
    if (formData.canSendISO === 'yes') score += 20;
    if (formData.supportsExtendedFields === 'yes') score += 15;
    maxScore += 55;

    // Infrastructure readiness
    if (formData.deploymentType === 'cloud') score += 10;
    if (parseInt(formData.itTeamSize) >= 5) score += 10;
    if (parseInt(formData.technicalExpertise) >= 3) score += 10;
    maxScore += 30;

    // Compliance preparedness
    if (formData.testingEnvironment === 'yes') score += 10;
    if (formData.rollbackCapability === 'yes') score += 5;
    maxScore += 15;

    return Math.round((score / maxScore) * 100) || 0;
  };

  const determineUpgradeStrategy = () => {
    const readiness = calculateReadiness();
    const systemAge = parseInt(formData.systemAge) || 0;

    if (readiness >= 70) {
      return {
        strategy: 'Minor Upgrades',
        description: 'Your systems are largely compatible. Focus on configuration and testing.',
        timeline: '2-3 months',
        estimatedCost: '€50K-€150K',
        risk: 'LOW'
      };
    } else if (readiness >= 40 && systemAge < 10) {
      return {
        strategy: 'Significant Upgrade',
        description: 'Core systems need updates but foundation is solid.',
        timeline: '4-6 months',
        estimatedCost: '€150K-€400K',
        risk: 'MEDIUM'
      };
    } else if (systemAge >= 10 || readiness < 40) {
      return {
        strategy: 'System Replacement',
        description: 'Legacy systems require full replacement or extensive overhaul.',
        timeline: '6-12 months',
        estimatedCost: '€400K-€1M+',
        risk: 'HIGH'
      };
    }

    return {
      strategy: 'Translation Service Bridge',
      description: 'Use SWIFT translation services while planning long-term solution.',
      timeline: 'Immediate (temporary)',
      estimatedCost: '€50K-€200K/year ongoing',
      risk: 'MEDIUM'
    };
  };

  const generateReport = () => {
    const readiness = calculateReadiness();
    const strategy = determineUpgradeStrategy();
    
    return {
      readiness,
      strategy,
      criticalGaps: getCriticalGaps(),
      recommendations: getRecommendations(readiness, strategy)
    };
  };

  const getCriticalGaps = () => {
    const gaps = [];
    
    if (formData.canSendISO !== 'yes') {
      gaps.push({
        priority: 'CRITICAL',
        gap: 'Cannot send ISO 20022 messages',
        impact: 'Messages will be rejected or incur translation fees after Nov 22',
        action: 'Upgrade messaging system or implement translation service'
      });
    }
    
    if (formData.canReceiveISO !== 'yes') {
      gaps.push({
        priority: 'HIGH',
        gap: 'Cannot receive ISO 20022 messages',
        impact: 'Will miss incoming payments from compliant institutions',
        action: 'Update receiving capabilities immediately'
      });
    }
    
    if (formData.supportsExtendedFields !== 'yes') {
      gaps.push({
        priority: 'HIGH',
        gap: 'Extended data fields not supported',
        impact: 'Data loss during message processing, reconciliation issues',
        action: 'Implement extended field mapping'
      });
    }
    
    if (formData.testingEnvironment !== 'yes') {
      gaps.push({
        priority: 'MEDIUM',
        gap: 'No testing environment',
        impact: 'Cannot validate changes without production risk',
        action: 'Establish sandbox/UAT environment'
      });
    }

    if (formData.rollbackCapability !== 'yes') {
      gaps.push({
        priority: 'MEDIUM',
        gap: 'No rollback capability',
        impact: 'Cannot revert if migration fails',
        action: 'Develop rollback procedures and backups'
      });
    }
    
    return gaps;
  };

  const getRecommendations = (readiness: number, strategy: any) => {
    const recommendations = [];
    
    recommendations.push({
      phase: 'Immediate (0-4 weeks)',
      actions: [
        'Complete detailed system inventory',
        'Engage with current vendor about ISO 20022 roadmap',
        'Establish testing environment',
        'Assess budget and secure approvals'
      ]
    });

    if (strategy.strategy === 'System Replacement') {
      recommendations.push({
        phase: 'Short-term (1-2 months)',
        actions: [
          'Deploy SWIFT translation service as bridge',
          'Begin vendor selection for replacement system',
          'Document current process flows',
          'Plan migration strategy'
        ]
      });
    } else {
      recommendations.push({
        phase: 'Short-term (1-2 months)',
        actions: [
          'Install vendor updates for ISO 20022',
          'Configure message format mappings',
          'Begin integration testing',
          'Train staff on new message formats'
        ]
      });
    }

    recommendations.push({
      phase: 'Medium-term (3-6 months)',
      actions: [
        'Complete user acceptance testing',
        'Execute parallel run with legacy and new formats',
        'Develop monitoring and alerting',
        'Create rollback procedures'
      ]
    });
    
    return recommendations;
  };

  const sections = [
    {
      title: 'Current Systems',
      description: 'Tell us about your existing infrastructure',
      fields: [
        { name: 'institutionName', label: 'Institution Name', type: 'text', placeholder: 'Your bank/credit union name' },
        { name: 'coreBankingSystem', label: 'Core Banking System', type: 'text', placeholder: 'e.g., Temenos, FIS, Jack Henry' },
        { name: 'systemVersion', label: 'System Version', type: 'text', placeholder: 'Version number or year' },
        { name: 'paymentGateway', label: 'Payment Gateway Provider', type: 'text', placeholder: 'Your payment processing vendor' },
        { 
          name: 'currentMessageFormat', 
          label: 'Current Message Format', 
          type: 'select',
          options: [
            { value: '', label: 'Select format' },
            { value: 'mt-only', label: 'MT (Legacy) only' },
            { value: 'mx-only', label: 'MX (ISO 20022) only' },
            { value: 'both', label: 'Both MT and MX' },
            { value: 'unknown', label: "Don't know" }
          ]
        },
        { name: 'systemAge', label: 'System Age (years)', type: 'number', placeholder: 'Years since installation' },
        { name: 'lastUpgrade', label: 'Last Major Upgrade', type: 'text', placeholder: 'Year of last upgrade' },
        { name: 'connectedSystems', label: 'Number of Connected Systems', type: 'number', placeholder: 'How many systems integrate?' }
      ]
    },
    {
      title: 'Technical Capabilities',
      description: 'Assess your current ISO 20022 readiness',
      fields: [
        {
          name: 'canReceiveISO',
          label: 'Can your system receive ISO 20022 messages?',
          type: 'select',
          options: [
            { value: '', label: 'Select answer' },
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'unknown', label: "Don't know" }
          ]
        },
        {
          name: 'canSendISO',
          label: 'Can your system send ISO 20022 messages?',
          type: 'select',
          options: [
            { value: '', label: 'Select answer' },
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'unknown', label: "Don't know" }
          ]
        },
        {
          name: 'supportsExtendedFields',
          label: 'Does your system support extended data fields?',
          type: 'select',
          options: [
            { value: '', label: 'Select answer' },
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'unknown', label: "Don't know" }
          ]
        },
        {
          name: 'processingType',
          label: 'Processing Type',
          type: 'select',
          options: [
            { value: '', label: 'Select type' },
            { value: 'api', label: 'API-based (real-time)' },
            { value: 'batch', label: 'Batch processing' },
            { value: 'mixed', label: 'Mixed (both)' }
          ]
        },
        {
          name: 'updateFrequency',
          label: 'System Update Frequency',
          type: 'select',
          options: [
            { value: '', label: 'Select frequency' },
            { value: 'realtime', label: 'Real-time' },
            { value: 'hourly', label: 'Hourly' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly or less' }
          ]
        }
      ]
    },
    {
      title: 'Infrastructure',
      description: 'Your operational environment and resources',
      fields: [
        {
          name: 'deploymentType',
          label: 'Deployment Type',
          type: 'select',
          options: [
            { value: '', label: 'Select type' },
            { value: 'onpremise', label: 'On-premise' },
            { value: 'cloud', label: 'Cloud' },
            { value: 'hybrid', label: 'Hybrid' }
          ]
        },
        { name: 'itTeamSize', label: 'IT Team Size', type: 'number', placeholder: 'Number of technical staff' },
        {
          name: 'technicalExpertise',
          label: 'Technical Expertise Level',
          type: 'select',
          options: [
            { value: '', label: 'Select level' },
            { value: '1', label: '1 - Basic (outsourced IT)' },
            { value: '2', label: '2 - Limited (small internal team)' },
            { value: '3', label: '3 - Moderate (competent team)' },
            { value: '4', label: '4 - Advanced (experienced team)' },
            { value: '5', label: '5 - Expert (highly skilled team)' }
          ]
        },
        {
          name: 'upgradeBudget',
          label: 'Available Budget for Compliance',
          type: 'select',
          options: [
            { value: '', label: 'Select range' },
            { value: '<50k', label: '< €50,000' },
            { value: '50-150k', label: '€50,000 - €150,000' },
            { value: '150-400k', label: '€150,000 - €400,000' },
            { value: '400k-1m', label: '€400,000 - €1M' },
            { value: '>1m', label: '> €1M' }
          ]
        },
        {
          name: 'acceptableDowntime',
          label: 'Acceptable Downtime for Migration',
          type: 'select',
          options: [
            { value: '', label: 'Select downtime' },
            { value: 'none', label: 'Zero downtime required' },
            { value: 'hours', label: 'Few hours (nights/weekends)' },
            { value: 'day', label: '1 business day' },
            { value: 'days', label: 'Multiple days acceptable' }
          ]
        }
      ]
    },
    {
      title: 'Compliance Readiness',
      description: 'Current compliance status and capabilities',
      fields: [
        {
          name: 'messageCompatibility',
          label: 'Message format compatibility verified?',
          type: 'select',
          options: [
            { value: '', label: 'Select answer' },
            { value: 'yes', label: 'Yes, fully verified' },
            { value: 'partial', label: 'Partially tested' },
            { value: 'no', label: 'Not yet tested' }
          ]
        },
        {
          name: 'dataFieldMapping',
          label: 'Data field mapping documented?',
          type: 'select',
          options: [
            { value: '', label: 'Select answer' },
            { value: 'complete', label: 'Complete documentation' },
            { value: 'inprogress', label: 'Work in progress' },
            { value: 'notstarted', label: 'Not started' }
          ]
        },
        {
          name: 'testingEnvironment',
          label: 'Testing/UAT environment available?',
          type: 'select',
          options: [
            { value: '', label: 'Select answer' },
            { value: 'yes', label: 'Yes, fully configured' },
            { value: 'limited', label: 'Limited/shared environment' },
            { value: 'no', label: 'No testing environment' }
          ]
        },
        {
          name: 'rollbackCapability',
          label: 'Rollback capability in place?',
          type: 'select',
          options: [
            { value: '', label: 'Select answer' },
            { value: 'yes', label: 'Yes, documented and tested' },
            { value: 'planned', label: 'Planned but not tested' },
            { value: 'no', label: 'No rollback plan' }
          ]
        },
        {
          name: 'monitoringAlerting',
          label: 'Monitoring and alerting configured?',
          type: 'select',
          options: [
            { value: '', label: 'Select answer' },
            { value: 'yes', label: 'Yes, comprehensive' },
            { value: 'basic', label: 'Basic monitoring only' },
            { value: 'no', label: 'No monitoring' }
          ]
        }
      ]
    }
  ];

  const nextStep = () => {
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(sections.length); // Results page
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const report = currentStep === sections.length ? generateReport() : null;

  if (currentStep === sections.length && report) {
    const { readiness, strategy, criticalGaps, recommendations } = report;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Technical Requirements Assessment
                </h1>
                <p className="text-muted-foreground">
                  {formData.institutionName || 'Your Institution'}
                </p>
              </div>
              <img src={logo} alt="PBC Logo" className="h-16 md:h-20" />
            </div>

            {/* Readiness Score */}
            <div className={`p-6 rounded-lg mb-6 ${
              readiness >= 70 ? 'bg-green-50 border-2 border-green-200' :
              readiness >= 40 ? 'bg-yellow-50 border-2 border-yellow-200' :
              'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">Technical Readiness Score</h2>
                <span className="text-4xl font-bold">{readiness}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${
                    readiness >= 70 ? 'bg-green-500' :
                    readiness >= 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${readiness}%` }}
                />
              </div>
            </div>

            {/* Recommended Strategy */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-blue-900 mb-3">Recommended Strategy</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approach</p>
                  <p className="text-lg font-semibold">{strategy.strategy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Risk Level</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    strategy.risk === 'LOW' ? 'bg-green-100 text-green-800' :
                    strategy.risk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {strategy.risk}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Timeline</p>
                  <p className="font-medium">{strategy.timeline}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estimated Cost</p>
                  <p className="font-medium">{strategy.estimatedCost}</p>
                </div>
              </div>
              <p className="mt-4 text-gray-700">{strategy.description}</p>
            </div>

            {/* Critical Gaps */}
            {criticalGaps.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Critical Gaps Identified</h2>
                <div className="space-y-3">
                  {criticalGaps.map((gap, index) => (
                    <div key={index} className={`border-l-4 p-4 rounded ${
                      gap.priority === 'CRITICAL' ? 'border-red-500 bg-red-50' :
                      gap.priority === 'HIGH' ? 'border-orange-500 bg-orange-50' :
                      'border-yellow-500 bg-yellow-50'
                    }`}>
                      <div className="flex items-start gap-3">
                        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          gap.priority === 'CRITICAL' ? 'text-red-600' :
                          gap.priority === 'HIGH' ? 'text-orange-600' :
                          'text-yellow-600'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              gap.priority === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                              gap.priority === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                              'bg-yellow-200 text-yellow-800'
                            }`}>
                              {gap.priority}
                            </span>
                            <span className="font-semibold text-gray-900">{gap.gap}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2"><strong>Impact:</strong> {gap.impact}</p>
                          <p className="text-sm text-gray-700"><strong>Action:</strong> {gap.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations Timeline */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Implementation Roadmap</h2>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <h3 className="font-semibold text-foreground mb-2">{rec.phase}</h3>
                    <ul className="space-y-1">
                      {rec.actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
              <h2 className="text-xl font-bold mb-2">Next Steps</h2>
              <p className="mb-4">
                This assessment provides a high-level overview. For detailed implementation planning, 
                vendor evaluation, and compliance support, schedule a consultation.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                  Schedule Consultation
                </button>
                <button 
                  onClick={() => window.print()}
                  className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setCurrentStep(0)}
                className="text-primary hover:text-primary/80 font-medium transition"
              >
                Start New Assessment
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            © 2025 Patrick Bayce-Chalvin - ISO 20022 Technical Assessment Tool
          </div>
        </div>
      </div>
    );
  }

  const currentSection = sections[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                ISO 20022 Technical Requirements Assessment
              </h1>
              <p className="text-muted-foreground">
                Evaluate your current systems and identify compliance gaps
              </p>
            </div>
            <img src={logo} alt="PBC Logo" className="h-12 md:h-16" />
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">
                Step {currentStep + 1} of {sections.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(((currentStep + 1) / sections.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / sections.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-1">
              {currentSection.title}
            </h2>
            <p className="text-sm text-muted-foreground">{currentSection.description}</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 mb-8">
            {currentSection.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.name as keyof typeof formData]}
                    onChange={(e) => updateField(field.name, e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition"
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={(e) => updateField(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition ${
                currentStep === 0
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
            >
              {currentStep === sections.length - 1 ? 'Generate Report' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          © 2025 Patrick Bayce-Chalvin - ISO 20022 Technical Assessment Tool
        </div>
      </div>
    </div>
  );
};

export default TechnicalRequirementsAssessment;
