## 📋 Duplicate Pattern Analysis

> Generated: 2026-04-22
> Strategy: 🏠 IDE-First
> Duplication Rate: **7%**

### 📊 Summary

| Metric | Count |
|--------|-------|
| Total Functions | 44 |
| Exact Duplicate Groups | 3 |
| Exact Duplicate Instances | 6 |
| Similar Function Groups | 3 |
| Similar Function Instances | 6 |
| Duplicate Blocks | 20 |

### 🎯 Action Plan: Refactoring Priorities

> Auto-generated optimization roadmap. Items sorted by ROI (Return on Investment).

#### Quick Overview

| Priority | Count | Est. Lines Saved | Est. Effort |
|----------|-------|------------------|-------------|
| 🔴 P0 (Immediate) | 0 | ~0 | High impact / Low effort |
| 🟡 P1 (Soon) | 3 | ~97 | Medium impact / Medium effort |
| 🟢 P2 (Later) | 3 | ~34 | Lower impact / Higher effort |
| **Total** | **6** | **~131** | - |

#### Detailed Action Items

##### 1. Extract to shared utility: `evaluateExpression`

| Attribute | Value |
|-----------|-------|
| **Type** | Exact Duplicate |
| **Priority** | P1 |
| **Estimated Effort** | Medium |
| **Impact** | Medium (~48 lines saved) |
| **Files Affected** | 2 |
| **Occurrences** | 2 |

**Locations:**
- `src/lib/calculations-browser.ts`:33 - `evaluateExpression`
- `src/lib/calculations.ts`:33 - `evaluateExpression`

**Suggested Refactoring:**
```javascript
/**
 * evaluateExpression - Extracted utility function
 * 
 * Extracted from 2 duplicate implementations
 * Locations:
 *   - src/lib/calculations-browser.ts:33
 *   - src/lib/calculations.ts:33
 *
 * @TODO: Add proper JSDoc with parameter descriptions
 * @TODO: Add unit tests for this extracted function
 */
function evaluateExpression(/* TODO: determine parameters */) {
  // TODO: Extract common logic here
  // Original implementation was ~48 lines
}

// Export for use across modules
module.exports = { evaluateExpression };
```

**Steps:**
1. Create shared utility function
2. Update all 2 occurrences to use the new implementation
3. Run tests to verify no behavioral changes
4. Remove old duplicate implementations

**Verification:**
- Use IDE's "Find All References" on `evaluateExpression` to confirm all usages are updated
- Run the test suite: `npm test` or equivalent

##### 2. Extract to shared utility: `determineRefraction`

| Attribute | Value |
|-----------|-------|
| **Type** | Exact Duplicate |
| **Priority** | P1 |
| **Estimated Effort** | Medium |
| **Impact** | Medium (~25 lines saved) |
| **Files Affected** | 2 |
| **Occurrences** | 2 |

**Locations:**
- `src/lib/calculations-browser.ts`:120 - `determineRefraction`
- `src/lib/calculations.ts`:109 - `determineRefraction`

**Suggested Refactoring:**
```javascript
/**
 * determineRefraction - Extracted utility function
 * 
 * Extracted from 2 duplicate implementations
 * Locations:
 *   - src/lib/calculations-browser.ts:120
 *   - src/lib/calculations.ts:109
 *
 * @TODO: Add proper JSDoc with parameter descriptions
 * @TODO: Add unit tests for this extracted function
 */
function determineRefraction(/* TODO: determine parameters */) {
  // TODO: Extract common logic here
  // Original implementation was ~25 lines
}

// Export for use across modules
module.exports = { determineRefraction };
```

**Steps:**
1. Create shared utility function
2. Update all 2 occurrences to use the new implementation
3. Run tests to verify no behavioral changes
4. Remove old duplicate implementations

**Verification:**
- Use IDE's "Find All References" on `determineRefraction` to confirm all usages are updated
- Run the test suite: `npm test` or equivalent

##### 3. Extract to shared utility: `determineImageType`

| Attribute | Value |
|-----------|-------|
| **Type** | Exact Duplicate |
| **Priority** | P1 |
| **Estimated Effort** | Medium |
| **Impact** | Medium (~24 lines saved) |
| **Files Affected** | 2 |
| **Occurrences** | 2 |

**Locations:**
- `src/lib/calculations-browser.ts`:94 - `determineImageType`
- `src/lib/calculations.ts`:83 - `determineImageType`

**Suggested Refactoring:**
```javascript
/**
 * determineImageType - Extracted utility function
 * 
 * Extracted from 2 duplicate implementations
 * Locations:
 *   - src/lib/calculations-browser.ts:94
 *   - src/lib/calculations.ts:83
 *
 * @TODO: Add proper JSDoc with parameter descriptions
 * @TODO: Add unit tests for this extracted function
 */
function determineImageType(/* TODO: determine parameters */) {
  // TODO: Extract common logic here
  // Original implementation was ~24 lines
}

// Export for use across modules
module.exports = { determineImageType };
```

**Steps:**
1. Create shared utility function
2. Update all 2 occurrences to use the new implementation
3. Run tests to verify no behavioral changes
4. Remove old duplicate implementations

**Verification:**
- Use IDE's "Find All References" on `determineImageType` to confirm all usages are updated
- Run the test suite: `npm test` or equivalent

##### 4. Consider abstraction: Create base class/strategy for 2 similar functions

| Attribute | Value |
|-----------|-------|
| **Type** | Similar Functions |
| **Priority** | P2 |
| **Estimated Effort** | High |
| **Impact** | Medium (~19 lines saved) |
| **Files Affected** | 2 |
| **Occurrences** | 2 |

**Locations:**
- `src/lib/calculations-browser.ts`:33 - `evaluateExpression`
- `src/lib/calculations.ts`:33 - `evaluateExpression`

**Steps:**
1. Analyze function similarities and extract common interface
2. Update all 2 occurrences to use the new implementation
3. Run tests to verify no behavioral changes
4. Remove old duplicate implementations

**Verification:**
- Use IDE's "Find All References" on `evaluateExpression` to confirm all usages are updated
- Run the test suite: `npm test` or equivalent

##### 5. Consider abstraction: Create base class/strategy for 2 similar functions

| Attribute | Value |
|-----------|-------|
| **Type** | Similar Functions |
| **Priority** | P2 |
| **Estimated Effort** | High |
| **Impact** | Low (~8 lines saved) |
| **Files Affected** | 2 |
| **Occurrences** | 2 |

**Locations:**
- `src/lib/calculations-browser.ts`:120 - `determineRefraction`
- `src/lib/calculations.ts`:109 - `determineRefraction`

**Steps:**
1. Analyze function similarities and extract common interface
2. Update all 2 occurrences to use the new implementation
3. Run tests to verify no behavioral changes
4. Remove old duplicate implementations

**Verification:**
- Use IDE's "Find All References" on `determineRefraction` to confirm all usages are updated
- Run the test suite: `npm test` or equivalent

##### 6. Consider abstraction: Create base class/strategy for 2 similar functions

| Attribute | Value |
|-----------|-------|
| **Type** | Similar Functions |
| **Priority** | P2 |
| **Estimated Effort** | High |
| **Impact** | Low (~7 lines saved) |
| **Files Affected** | 2 |
| **Occurrences** | 2 |

**Locations:**
- `src/lib/calculations-browser.ts`:94 - `determineImageType`
- `src/lib/calculations.ts`:83 - `determineImageType`

**Steps:**
1. Analyze function similarities and extract common interface
2. Update all 2 occurrences to use the new implementation
3. Run tests to verify no behavioral changes
4. Remove old duplicate implementations

**Verification:**
- Use IDE's "Find All References" on `determineImageType` to confirm all usages are updated
- Run the test suite: `npm test` or equivalent


### 🔴 Exact Duplicates

> These code blocks are identical copies. **Strong refactoring candidates.**

#### Group (2 copies, 48 lines)

- **evaluateExpression** → `src/lib/calculations-browser.ts`:33
- **evaluateExpression** → `src/lib/calculations.ts`:33

> 💡 Extract into a shared utility function (found in 2 locations)

#### Group (2 copies, 25 lines)

- **determineRefraction** → `src/lib/calculations-browser.ts`:120
- **determineRefraction** → `src/lib/calculations.ts`:109

> 💡 Extract into a shared utility function (found in 2 locations)

#### Group (2 copies, 24 lines)

- **determineImageType** → `src/lib/calculations-browser.ts`:94
- **determineImageType** → `src/lib/calculations.ts`:83

> 💡 Extract into a shared utility function (found in 2 locations)

### 🟡 Similar Functions

> These functions have similar structure but may not be exact copies. Review for consolidation.

#### Similarity: 100% (2 functions)

- **evaluateExpression** → `src/lib/calculations-browser.ts`:33 (99 tokens)
- **evaluateExpression** → `src/lib/calculations.ts`:33 (99 tokens)

#### Similarity: 100% (2 functions)

- **determineImageType** → `src/lib/calculations-browser.ts`:94 (36 tokens)
- **determineImageType** → `src/lib/calculations.ts`:83 (36 tokens)

#### Similarity: 100% (2 functions)

- **determineRefraction** → `src/lib/calculations-browser.ts`:120 (40 tokens)
- **determineRefraction** → `src/lib/calculations.ts`:109 (40 tokens)

### 🟠 Duplicate Code Blocks

> These code blocks appear in multiple locations.

#### Block (73 locations, 6 lines)

```
        className
      )}
      {...props}
    />
  )
}
```

**Found in:**
- `src\components\ui\alert-dialog.tsx`:36
- `src\components\ui\alert-dialog.tsx`:84
- `src\components\ui\alert.tsx`:40
- `src\components\ui\alert.tsx`:56
- `src\components\ui\avatar.tsx`:14

#### Block (73 locations, 6 lines)

```
      )}
      {...props}
    />
  )
}

```

**Found in:**
- `src\components\ui\alert-dialog.tsx`:37
- `src\components\ui\alert-dialog.tsx`:85
- `src\components\ui\alert.tsx`:41
- `src\components\ui\alert.tsx`:57
- `src\components\ui\avatar.tsx`:15

#### Block (14 locations, 6 lines)

```
      {...props}
    />
  )
}

export {
```

**Found in:**
- `src\components\ui\alert-dialog.tsx`:136
- `src\components\ui\button-group.tsx`:69
- `src\components\ui\card.tsx`:77
- `src\components\ui\command.tsx`:164
- `src\components\ui\context-menu.tsx`:227

#### Block (12 locations, 6 lines)

```
      gestureControl: {
        finger: 'index',
        direction: 'horizontal',
        sensitivit...
```

**Found in:**
- `src\lib\additional-experiments.ts`:197
- `src\lib\additional-experiments.ts`:288
- `src\lib\additional-experiments.ts`:470
- `src\lib\additional-experiments.ts`:587
- `src\lib\additional-experiments.ts`:688

#### Block (12 locations, 6 lines)

```
        finger: 'index',
        direction: 'horizontal',
        sensitivity: 0.5,
      },
    },
...
```

**Found in:**
- `src\lib\additional-experiments.ts`:198
- `src\lib\additional-experiments.ts`:289
- `src\lib\additional-experiments.ts`:471
- `src\lib\additional-experiments.ts`:588
- `src\lib\additional-experiments.ts`:689

### 🏠 IDE-First Strategy Active

> This analysis used IDE tools for enhanced semantic detection.
> Use **codebase_search** to find similar code patterns.
