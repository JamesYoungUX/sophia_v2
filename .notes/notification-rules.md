# Notification Rules

## Care Exception Notifications

### Criteria for Notifications

Notifications are only displayed for care exceptions that meet **ALL** of the following criteria:

1. **Severity**: `high` only
2. **Status**: `open` only

### Rationale

- High severity cases require immediate attention regardless of escalation status
- Open status ensures only active, unresolved cases appear as notifications
- This filtering prevents notification fatigue while ensuring critical cases are surfaced
- Medium and low severity cases are handled through normal workflow without notifications

### Notification Content Structure

Each notification should include:

1. **Title**: `[Exception Type] - High Severity`
2. **Description**: `[Patient ID]: [specific details about the exception]`
3. **Timestamp**: `[Detection/escalation details] • [time ago]`

### Care Exception Types

Based on the schema, valid care exception types include:

- `bp_noncompliance` - Blood pressure compliance issues
- `missed_appointment` - Missed scheduled appointments
- `medication_nonadherence` - Medication compliance issues
- `postop_red_flag` - Post-operative complications or concerns
- `questionnaire_missed` - Missed patient questionnaires/surveys
- `abnormal_lab_result` - Critical or abnormal laboratory results

### AI Agents That Can Escalate

- `compliance` - Monitors adherence to care plans
- `patient_engagement` - Tracks patient interaction and participation
- `quantum` - Advanced analytics and pattern detection
- `genesis` - General care coordination and management
- `care_manager` - Overall care management oversight

### Implementation Notes

- Notifications surface high-priority cases that need immediate attention
- The notification system filters out medium/low severity and non-open cases
- Only high severity + open status cases appear to avoid notification fatigue
- Escalation by AI agents indicates cases requiring human intervention, but escalation is not required for notifications
