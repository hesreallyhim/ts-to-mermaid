# Union Type Conversion Implementation Plan

## Overview
Refactor the TypeScript to Mermaid converter to follow the union conversion ruleset, providing more readable and accurate diagrams based on union complexity.

## Current State
- All unions are converted to enumeration classes
- No inline annotations
- No special handling for discriminated unions
- No support for complex type notes

## Target State
- Simple unions (≤5 values) use inline annotation
- Large unions (>5 values) use enumeration classes  
- Discriminated unions use inheritance hierarchy
- Complex/mixed unions use note annotations
- Reusable unions become dedicated type classes

## Implementation Tasks

### Phase 1: Core Refactoring
1. **Analyze Union Types**
   - [ ] Add union type analyzer to categorize unions:
     - Simple string/number literals (≤5 values)
     - Large literal unions (>5 values)
     - Discriminated unions (with common discriminator property)
     - Mixed/complex unions
     - Primitive unions (string | number)
   - [ ] Track union usage frequency for reusability detection

2. **Update Type Collection**
   - [ ] Modify `collectTypes()` to store union metadata
   - [ ] Add union type classification to TypeInfo interface
   - [ ] Store raw union type information for inline rendering

3. **Implement Inline Annotations**
   - [ ] Update property rendering to support inline unions
   - [ ] Handle proper escaping for Mermaid syntax
   - [ ] Format unions correctly: `"active" | "inactive" | "pending"`

### Phase 2: Advanced Union Handling
4. **Discriminated Union Support**
   - [ ] Detect discriminated unions by common property
   - [ ] Generate base interface with discriminator
   - [ ] Create inheritance relationships for variants
   - [ ] Update relationship tracking

5. **Note Annotation Support**
   - [ ] Add note generation for complex unions
   - [ ] Implement note positioning logic
   - [ ] Handle multiline type definitions in notes

6. **Reusable Type Detection**
   - [ ] Track union usage across multiple properties
   - [ ] Generate dedicated type classes for frequently used unions
   - [ ] Update references to use the type class

### Phase 3: Testing & Edge Cases
7. **Update Test Suite**
   - [ ] Modify union-types.ts test to cover all rules
   - [ ] Add test cases for each rule in the ruleset
   - [ ] Test edge cases:
     - Nested unions
     - Generic unions
     - Function unions
     - Unions with type parameters

8. **Handle Edge Cases**
   - [ ] Unions containing interfaces/classes
   - [ ] Recursive union types
   - [ ] Template literal types in unions
   - [ ] Conditional types resulting in unions

### Phase 4: Documentation & Cleanup
9. **Update Documentation**
   - [ ] Document new union handling in README
   - [ ] Add examples for each union type
   - [ ] Update CLAUDE.md with implementation details

10. **Code Cleanup**
    - [ ] Remove old union enumeration logic
    - [ ] Refactor for maintainability
    - [ ] Add comments explaining union rules

## Technical Details

### New Data Structures
```typescript
interface UnionMetadata {
  kind: 'simple' | 'large' | 'discriminated' | 'complex' | 'primitive';
  values?: string[];
  discriminator?: string;
  isReusable?: boolean;
  rawType?: string;
}

interface TypeInfo {
  // existing fields...
  unionMetadata?: UnionMetadata;
}
```

### Decision Logic
```typescript
function classifyUnion(unionType: ts.UnionType): UnionMetadata {
  // 1. Check if discriminated union
  // 2. Count literal values
  // 3. Check complexity
  // 4. Return appropriate classification
}
```

### Implementation Decisions

#### Mixed Literals and Non-literals
**Decision**: Unions mixing literals with non-literals (e.g., `"auto" | number | CustomType`) will be classified as "complex" and use note annotations.
**Rationale**: These unions don't fit cleanly into enumeration or inline patterns, and note annotations preserve the full type information.

#### Template Literal Types
**Decision**: Template literal types (e.g., `` `${string}-${number}` ``) will be treated as complex unions and use note annotations.
**Rationale**: Template literals can represent infinite sets of values and are best expressed in their original TypeScript syntax.

#### Intersection Types Within Unions
**Decision**: Unions containing intersections (e.g., `(A & B) | C`) will be classified as complex unions.
**Rationale**: Intersection types add complexity that's difficult to represent inline or as enumerations without losing meaning.

#### Discriminated Union Detection
**Decision**: Initially support only single-property discriminators. Multiple discriminators will be treated as complex unions.
**Rationale**: Single discriminators are the most common pattern and easier to visualize. Multi-discriminator support can be added in a future enhancement.

#### Testing Strategy
**Decision**: Create separate test files for each union category while keeping the original `union-types.ts` for regression testing.
**Test Files**:
- `tests/union-simple.ts` - Simple literal unions (≤5 values)
- `tests/union-large.ts` - Large literal unions (>5 values)
- `tests/union-discriminated.ts` - Discriminated unions
- `tests/union-complex.ts` - Complex/mixed unions
- `tests/union-edge-cases.ts` - Template literals, intersections, etc.

### Rendering Strategy
- Simple unions: Render inline in property
- Large unions: Create enumeration class
- Discriminated: Create inheritance hierarchy
- Complex: Add as note with reference

## Success Criteria
- [ ] Simple 3-value unions render inline
- [ ] Large unions still use enumeration
- [ ] Discriminated unions show inheritance
- [ ] Complex unions have readable notes
- [ ] All existing tests pass
- [ ] New union tests cover all rules

## Timeline Estimate
- Phase 1: 2-3 hours (core refactoring)
- Phase 2: 3-4 hours (advanced features)
- Phase 3: 2 hours (testing)
- Phase 4: 1 hour (documentation)

Total: ~10-12 hours of focused work

## Risk Mitigation
- Keep old logic available via flag initially
- Extensive test coverage before removing old code
- Snapshot testing to catch regressions
- Manual review of generated diagrams