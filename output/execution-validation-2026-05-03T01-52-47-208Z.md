# Execution Log Validation Report

Generated: 2026/5/3 09:52:47

## Summary

| Metric | Value |
|--------|-------|
| Status | ⚠️ passed_with_warnings |
| Overall Score | 62/100 |
| Completed Stages | 0/5 |
| Failed Stages | 0 |
| Warnings | 7 |

## Stage Validations

### ANALYSE

- **Status**: ⚠️ passed_with_warnings
- **Score**: 75/100
- **Warnings**:
  - ⚠️ JSON metadata missing or malformed
- **Checks**:

  | Check | Status | Points |
  |-------|--------|--------|
  | required_artifact_exists | ✅ | 20 |
  | optional_artifact_exists | ❌ | 0 |
  | content_length | ✅ | 15 |
  | section_count | ✅ | 15 |
  | required_sections | ✅ | 25 |
  | json_metadata | ❌ | 0 |

### ARCHITECT

- **Status**: ⚠️ passed_with_warnings
- **Score**: 50/100
- **Warnings**:
  - ⚠️ Missing required sections: components, tech-stack, data-flow
  - ⚠️ JSON metadata missing or malformed
- **Checks**:

  | Check | Status | Points |
  |-------|--------|--------|
  | required_artifact_exists | ✅ | 20 |
  | optional_artifact_exists | ❌ | 0 |
  | content_length | ✅ | 15 |
  | section_count | ✅ | 15 |
  | required_sections | ❌ | 0 |
  | json_metadata | ❌ | 0 |

### PLAN

- **Status**: ⚠️ passed_with_warnings
- **Score**: 50/100
- **Warnings**:
  - ⚠️ Missing required sections: phases
  - ⚠️ JSON metadata missing or malformed
- **Checks**:

  | Check | Status | Points |
  |-------|--------|--------|
  | required_artifact_exists | ✅ | 20 |
  | optional_artifact_exists | ❌ | 0 |
  | content_length | ✅ | 15 |
  | section_count | ✅ | 15 |
  | required_sections | ❌ | 0 |
  | json_metadata | ❌ | 0 |

### CODE

- **Status**: ⚠️ passed_with_warnings
- **Score**: 60/100
- **Warnings**:
  - ⚠️ Too few sections (0, expected >= 1)
- **Checks**:

  | Check | Status | Points |
  |-------|--------|--------|
  | required_artifact_exists | ✅ | 20 |
  | content_length | ✅ | 15 |
  | section_count | ❌ | 0 |
  | required_sections | ✅ | 25 |

### TEST

- **Status**: ⚠️ passed_with_warnings
- **Score**: 75/100
- **Warnings**:
  - ⚠️ JSON metadata missing or malformed
- **Checks**:

  | Check | Status | Points |
  |-------|--------|--------|
  | required_artifact_exists | ✅ | 20 |
  | optional_artifact_exists | ❌ | 0 |
  | content_length | ✅ | 15 |
  | section_count | ✅ | 15 |
  | required_sections | ✅ | 25 |
  | json_metadata | ❌ | 0 |

## Flow Validation

- **Status**: ✅ passed

## Integrity Checks

| Check | Status | Score |
|-------|--------|-------|
| all_required_artifacts_present | ✅ | N/A |
| content_completeness | ❌ | 64% |
| metadata_quality | ❌ | 0% |

## Recommendations

### 🟡 [MEDIUM] low_quality
- **Message**: Overall execution score (0) below threshold
- **Action**: Review output completeness and structure

### 🟢 [LOW] missing_sections
- **Message**: Stage ARCHITECT missing sections: components, tech-stack, data-flow
- **Action**: Add required sections to output templates
- **Stage**: ARCHITECT

### 🟢 [LOW] missing_sections
- **Message**: Stage PLAN missing sections: phases
- **Action**: Add required sections to output templates
- **Stage**: PLAN
