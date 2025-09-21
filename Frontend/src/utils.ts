// === utils.ts ================================================================
//
// Misc. util functions.
//
// =============================================================================

// === match ===================================================================
//
// Takes as arguments an object which maps keys to functions which each take
// no arguments and return elements of the same type, plus a key corresponding
// to one of the keys in the object. Calls the function indicated by the key and
// returns the result. If key does not exist in the object, throws an error.
//
// Imitates match syntax (tagged union handling) in Rust.
//
// =============================================================================
export const match = <KeyType extends string | number, ReturnType> (
  matchArms: Record<KeyType, () => ReturnType>,
  key: KeyType
): ReturnType => {
  if (! (key in matchArms)) {
    throw new Error(`Key ${key} not handled by match arm`);
  } else {
    return matchArms[key]();
  }
};
