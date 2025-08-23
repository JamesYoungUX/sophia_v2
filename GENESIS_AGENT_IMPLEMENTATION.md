# Genesis Agent Implementation Plan

## 🧠 **Genesis Agent: Evidence-Based Care Plan Optimization**

### **Core Purpose & Philosophy**

- **Evidence-First**: All suggestions backed by peer-reviewed research
- **Human-in-the-Loop**: No changes without physician review and approval
- **Continuous Learning**: Real-time ingestion of new medical literature
- **Outcome-Driven**: Focus on demonstrably improving patient outcomes
- **Transparency**: Full citation and rationale for all recommendations

---

## 🛠️ **Technical Implementation Requirements**

### **1. Backend API Components**

#### **Literature Ingestion Service**

```typescript
interface LiteratureIngestionService {
  // Monitor medical databases
  monitorPubMed(): Promise<MedicalPublication[]>;
  monitorGuidelines(): Promise<GuidelineUpdate[]>;
  monitorCochraneReviews(): Promise<SystematicReview[]>;

  // Process and filter
  filterRelevantLiterature(
    publications: MedicalPublication[],
    carePlans: CarePlan[],
  ): Promise<RelevantPublication[]>;
  assessEvidenceQuality(
    publication: MedicalPublication,
  ): Promise<EvidenceQuality>;
}
```

#### **Care Plan Analysis Engine**

```typescript
interface CarePlanAnalysisEngine {
  // Compare plans against evidence
  comparePlanToEvidence(
    carePlan: CarePlan,
    evidence: Evidence[],
  ): Promise<GapAnalysis[]>;
  identifyOutdatedProtocols(
    carePlan: CarePlan,
    guidelines: Guideline[],
  ): Promise<OutdatedProtocol[]>;

  // Generate recommendations
  generateRecommendations(
    gaps: GapAnalysis[],
  ): Promise<GenesisRecommendation[]>;
  prioritizeRecommendations(
    recommendations: GenesisRecommendation[],
  ): Promise<PrioritizedRecommendation[]>;
}
```

#### **Recommendation Management System**

```typescript
interface RecommendationSystem {
  // Store and track recommendations
  createRecommendation(recommendation: GenesisRecommendation): Promise<string>;
  updateRecommendationStatus(
    id: string,
    status: "pending" | "approved" | "rejected",
  ): Promise<void>;

  // Clinical review workflow
  assignToReviewer(recommendationId: string, reviewerId: string): Promise<void>;
  submitReview(recommendationId: string, review: ClinicalReview): Promise<void>;
}
```

### **2. Database Schema Extensions**

#### **Genesis Agent Tables**

```sql
-- Literature tracking
CREATE TABLE genesis_literature_ingestion (
  id UUID PRIMARY KEY,
  source VARCHAR(100), -- 'pubmed', 'cochrane', 'guidelines'
  publication_id VARCHAR(255),
  title TEXT,
  abstract TEXT,
  authors TEXT[],
  publication_date DATE,
  evidence_quality VARCHAR(10), -- 'A', 'B', 'C', 'D'
  relevance_score DECIMAL(3,2),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recommendations
CREATE TABLE genesis_recommendations (
  id UUID PRIMARY KEY,
  care_plan_id UUID REFERENCES care_plan(id),
  task_id UUID REFERENCES task_specification(id),
  recommendation_type VARCHAR(50), -- 'update', 'add', 'remove', 'modify'
  title TEXT,
  rationale TEXT,
  evidence_sources JSONB,
  implementation_steps JSONB,
  priority VARCHAR(20), -- 'high', 'medium', 'low'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_by UUID REFERENCES user(id),
  reviewed_at TIMESTAMP
);

-- Clinical reviews
CREATE TABLE genesis_clinical_reviews (
  id UUID PRIMARY KEY,
  recommendation_id UUID REFERENCES genesis_recommendations(id),
  reviewer_id UUID REFERENCES user(id),
  decision VARCHAR(20), -- 'approve', 'reject', 'request_changes'
  comments TEXT,
  evidence_assessment JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **3. Frontend Components**

#### **Genesis Agent Dashboard**

```typescript
interface GenesisAgentDashboard {
  // Literature feed
  LiteratureFeed: React.FC<{ publications: MedicalPublication[] }>;

  // Recommendations management
  RecommendationsList: React.FC<{ recommendations: GenesisRecommendation[] }>;
  RecommendationDetail: React.FC<{ recommendation: GenesisRecommendation }>;

  // Clinical review interface
  ClinicalReviewForm: React.FC<{ recommendation: GenesisRecommendation }>;
  EvidencePackage: React.FC<{ evidence: Evidence[] }>;

  // Analytics and tracking
  OutcomeTracking: React.FC<{ implementedChanges: ImplementedChange[] }>;
  LearningAnalytics: React.FC<{ analytics: LearningAnalytics }>;
}
```

---

## 👥 **Human Input Required**

### **1. Clinical Expertise (Physicians/Clinicians)**

- **Evidence Assessment**: Review literature quality and clinical relevance
- **Recommendation Evaluation**: Clinical judgment on AI suggestions
- **Risk-Benefit Analysis**: Human assessment of potential risks vs. benefits
- **Implementation Decisions**: Final approval/rejection of recommendations

### **2. Clinical Informatics/IT Staff**

- **System Configuration**: Define evidence sources and relevance filters
- **Quality Thresholds**: Set minimum evidence quality standards
- **Integration Setup**: Connect to EHR and clinical workflows
- **Alert Configuration**: Set up notifications and review processes

### **3. Healthcare Administrators**

- **Policy Decisions**: Define review processes and approval authority
- **Implementation Policies**: Establish rollout procedures
- **Resource Planning**: Allocate budget and staff for implementation
- **Quality Assurance**: Define outcome monitoring and audit requirements

### **4. Data Scientists/AI Engineers**

- **Algorithm Tuning**: Fine-tune relevance scoring and prioritization
- **System Optimization**: Improve performance and reduce false positives
- **Learning Loop Enhancement**: Improve system learning from feedback

---

## 🔄 **Implementation Workflow**

### **Phase 1: Foundation (Human Input Heavy)**

1. **Clinical Team Input**: Define care plan domains and evidence priorities
2. **IT Configuration**: Set up literature monitoring sources and filters
3. **Policy Definition**: Establish review and approval workflows
4. **Integration Planning**: Define how Genesis fits into existing clinical processes

### **Phase 2: Training & Calibration (Collaborative)**

1. **Initial Recommendations**: Genesis generates first batch of recommendations
2. **Clinical Review**: Physicians review and provide feedback on initial suggestions
3. **Algorithm Adjustment**: Data scientists tune algorithms based on clinical feedback
4. **Process Refinement**: Adjust workflows based on real-world usage

### **Phase 3: Optimization (Continuous)**

1. **Outcome Tracking**: Monitor the impact of implemented recommendations
2. **Continuous Learning**: System improves based on outcome data and clinical feedback
3. **Process Evolution**: Refine workflows and policies based on experience

---

## 🎯 **Key Human Decision Points**

### **Before Implementation:**

- Which care plans should Genesis monitor?
- What evidence sources are most relevant?
- Who has authority to approve recommendations?
- What are the minimum evidence quality thresholds?

### **During Operation:**

- Should this recommendation be approved?
- When should this change be implemented?
- Are there any patient safety concerns?
- Do we have resources to implement this change?

### **After Implementation:**

- Did this change improve outcomes as predicted?
- Should we adjust the recommendation algorithms?
- Are there any unintended consequences?
- Should we expand Genesis to other care areas?

---

## 📋 **Implementation Steps**

### **Step 1: Literature Ingestion System**

- Set up PubMed API integration
- Implement relevance filtering algorithms
- Create evidence quality assessment tools
- Build literature monitoring dashboard

### **Step 2: Care Plan Analysis Engine**

- Develop protocol comparison algorithms
- Build gap detection capabilities
- Create recommendation generation framework
- Implement priority ranking system

### **Step 3: Clinical Review Workflow**

- Create physician review dashboard
- Implement approval workflow system
- Build audit trail and version control
- Set up notification and alert system

### **Step 4: Integration & Testing**

- Connect with existing care plan system
- Integrate with task management
- Test with real clinical scenarios
- Validate with clinical teams

### **Step 5: Deployment & Optimization**

- Deploy to production environment
- Monitor system performance
- Collect clinical feedback
- Iterate and improve algorithms

---

## 🚀 **Step 1: Literature Ingestion System - COMPLETED**

### ✅ **What We've Built**

#### **1. PubMed API Service** (`apps/api/lib/genesis-pubmed.ts`)

- **PubMed E-utilities Integration**: Full API integration with NCBI's PubMed service
- **Intelligent Search**: Automated query building with keywords, date ranges, and publication types
- **Rate Limiting**: Respects PubMed's API limits (3 req/sec without key, 10 req/sec with key)
- **XML Parsing**: Robust parsing of PubMed XML responses
- **Evidence Quality Assessment**: Automated grading (A, B, C, D) based on study design and journal impact
- **Relevance Scoring**: AI-powered filtering based on title, abstract, and MeSH term matches

#### **2. Database Schema** (`db/schema/genesis-agent.ts`)

- **Literature Ingestion Table**: Stores all processed publications with metadata
- **Recommendations Table**: Links literature to care plan recommendations
- **Clinical Reviews Table**: Tracks physician review and approval workflow
- **Evidence Sources Table**: Manages different literature sources (PubMed, Cochrane, etc.)
- **Care Plan Keywords Table**: Defines search terms for each care plan
- **Audit Log Table**: Comprehensive activity tracking

#### **3. Test Suite** (`debug/test-pubmed-integration.ts`)

- **Integration Testing**: Verifies PubMed API connectivity and functionality
- **Multi-Domain Testing**: Tests hypertension, diabetes, and surgical care literature
- **Quality Assessment**: Validates evidence quality scoring and relevance filtering
- **Error Handling**: Tests error scenarios and rate limiting

### 🔧 **Key Features Implemented**

#### **Literature Processing Pipeline**

```typescript
// Search for relevant literature
const results = await pubmedService.searchLiterature({
  keywords: ["hypertension", "blood pressure management"],
  dateFrom: new Date("2024-01-01"),
  maxResults: 50,
  publicationTypes: ["Clinical Trial", "Meta-Analysis", "Systematic Review"],
});

// Each result includes:
// - Full publication metadata (title, authors, journal, DOI)
// - Evidence quality assessment (A, B, C, D grade)
// - Relevance score (0-1) for care plan matching
// - MeSH terms and keywords for categorization
```

#### **Evidence Quality Assessment**

- **Grade A**: Systematic reviews and meta-analyses
- **Grade B**: Randomized controlled trials
- **Grade C**: Observational studies and case series
- **Grade D**: Case reports and expert opinion

#### **Relevance Filtering**

- **Title Matches**: 40% weight for keyword matches in title
- **Abstract Matches**: 20% weight for keyword matches in abstract
- **MeSH Term Matches**: 30% weight for Medical Subject Heading matches
- **Configurable Threshold**: Only articles with >30% relevance are processed

### 📊 **Test Results**

Run the test to see PubMed integration in action:

```bash
bun run debug/test-pubmed-integration.ts
```

### 🎯 **Next Steps**

**Step 2: Care Plan Analysis Engine**

- Develop protocol comparison algorithms
- Build gap detection capabilities
- Create recommendation generation framework
- Implement priority ranking system

**Step 3: Clinical Review Workflow**

- Create physician review dashboard
- Implement approval workflow system
- Build audit trail and version control
- Set up notification and alert system

---

## 🚀 **Step 1: Literature Ingestion System - COMPLETED**

### ✅ **What We've Built**

#### **1. PubMed API Service** (`apps/api/lib/genesis-pubmed.ts`)

- **PubMed E-utilities Integration**: Full API integration with NCBI's PubMed service
- **Intelligent Search**: Automated query building with keywords, date ranges, and publication types
- **Rate Limiting**: Respects PubMed's API limits (3 req/sec without key, 10 req/sec with key)
- **XML Parsing**: Robust parsing of PubMed XML responses
- **Evidence Quality Assessment**: Automated grading (A, B, C, D) based on study design and journal impact
- **Relevance Scoring**: AI-powered filtering based on title, abstract, and MeSH term matches

#### **2. Database Schema** (`db/schema/genesis-agent.ts`)

- **Literature Ingestion Table**: Stores all processed publications with metadata
- **Recommendations Table**: Links literature to care plan recommendations
- **Clinical Reviews Table**: Tracks physician review and approval workflow
- **Evidence Sources Table**: Manages different literature sources (PubMed, Cochrane, etc.)
- **Care Plan Keywords Table**: Defines search terms for each care plan
- **Audit Log Table**: Comprehensive activity tracking

#### **3. Test Suite** (`debug/test-pubmed-integration.ts`)

- **Integration Testing**: Verifies PubMed API connectivity and functionality
- **Multi-Domain Testing**: Tests hypertension, diabetes, and surgical care literature
- **Quality Assessment**: Validates evidence quality scoring and relevance filtering
- **Error Handling**: Tests error scenarios and rate limiting

#### **4. Sample Care Plans** (`db/seeds/care-plans.ts`)

- **Hypertension Management Protocol**: Evidence-based BP management with AHA guidelines
- **Type 2 Diabetes Management Protocol**: ADA-compliant diabetes care with SGLT2 inhibitors
- **Enhanced Recovery After Surgery Protocol**: ERAS protocol for surgical patients
- **Structured Content**: Phases, tasks, evidence sources, and target metrics
- **Version Control**: Complete versioning with change tracking

### 🔧 **Key Features Implemented**

#### **Literature Processing Pipeline**

```typescript
// Search for relevant literature
const results = await pubmedService.searchLiterature({
  keywords: ["hypertension", "blood pressure management"],
  dateFrom: new Date("2024-01-01"),
  maxResults: 50,
  publicationTypes: ["Clinical Trial", "Meta-Analysis", "Systematic Review"],
});

// Each result includes:
// - Full publication metadata (title, authors, journal, DOI)
// - Evidence quality assessment (A, B, C, D grade)
// - Relevance score (0-1) for care plan matching
// - MeSH terms and keywords for categorization
```

#### **Care Plan Structure**

```typescript
// Example care plan content structure
{
  phases: [
    {
      name: "Initial Assessment",
      daysFromStart: 0,
      tasks: [
        {
          taskId: "HTN-001",
          name: "Blood Pressure Measurement",
          evidence: {
            source: "AHA Hypertension Guidelines 2024",
            url: "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000200",
            level: "A"
          }
        }
      ]
    }
  ],
  targetBP: "<130/80 mmHg",
  evidenceLastUpdated: "2024-01-15"
}
```

#### **Evidence Quality Assessment**

- **Grade A**: Systematic reviews and meta-analyses
- **Grade B**: Randomized controlled trials
- **Grade C**: Observational studies and case series
- **Grade D**: Case reports and expert opinion

#### **Relevance Filtering**

- **Title Matches**: 40% weight for keyword matches in title
- **Abstract Matches**: 20% weight for keyword matches in abstract
- **MeSH Term Matches**: 30% weight for Medical Subject Heading matches
- **Configurable Threshold**: Only articles with >30% relevance are processed

### 📊 **Test Results**

Run the test to see PubMed integration in action:

```bash
bun run debug/test-pubmed-integration.ts
```

### 🎯 **Next Steps**

**Step 2: Care Plan Analysis Engine**

- Develop protocol comparison algorithms
- Build gap detection capabilities
- Create recommendation generation framework
- Implement priority ranking system

**Step 3: Clinical Review Workflow**

- Create physician review dashboard
- Implement approval workflow system
- Build audit trail and version control
- Set up notification and alert system

---

## 🚀 **Ready for Step 2 Discussion**

Step 1 is complete! We now have:

- ✅ PubMed API integration working
- ✅ Sample care plans in the database
- ✅ Evidence quality assessment
- ✅ Relevance filtering

Let's move on to **Step 2: Care Plan Analysis Engine** where we'll build the intelligence to compare care plans against new evidence and generate recommendations.
