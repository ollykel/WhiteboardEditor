// === Misc. Utils =============================================================
//
// =============================================================================

interface ResultOk<OkType> {
  result: 'ok';
  data: OkType;
}

interface ResultErr<ErrType> {
  result: 'err';
  err: ErrType;
}

// === Result ==================================================================
//
// Mimics Result type in Rust.
//
// =============================================================================
export type Result<OkType, ErrType> = ResultOk<OkType> | ResultErr<ErrType>;
