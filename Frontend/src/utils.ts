// === utils.ts ================================================================
//
// Misc. util functions.
//
// =============================================================================

// === match ===================================================================
//
//
//
// =============================================================================
export const match = <KeyType extends string | number, ReturnType> (matchArms: Record<KeyType, () => ReturnType>, key: KeyType): ReturnType => {
  if (! (key in matchArms)) {
    throw new Error(`Key ${key} not handled by match arm`);
  } else {
    return matchArms[key]();
  }
};
