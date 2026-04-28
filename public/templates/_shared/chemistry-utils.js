/* chemistry-utils.js — chemistry-specific formula atoms for experiment templates.
 *
 * Companion to physics-utils.js. Pure formulas only; no DOM / no rendering.
 * Used as a convenience library for v2-atomic templates that need quick local
 * calculations (e.g. tooltips, validation hints) while the authoritative
 * computation still goes through the L1 engine via compute_request.
 *
 * Loaded with <script src="/templates/_shared/chemistry-utils.js"></script>
 */

(function () {
  'use strict';

  /* ---------- Constants ---------- */
  const R = 8.314;      // J / (mol·K)
  const R_ATM = 0.0821; // L·atm / (mol·K)
  const Kw = 1.0e-14;   // Ion product of water at 25°C

  /* ---------- Acid / Base / pH ---------- */

  function phFromConcentration(hConc) {
    if (!(hConc > 0)) return 14; // guard
    return -Math.log10(hConc);
  }

  function pohFromPh(ph) {
    return 14 - ph;
  }

  function hFromPh(ph) {
    return Math.pow(10, -ph);
  }

  /**
   * titrationPh — pH at arbitrary point in strong-acid vs strong-base titration.
   * Mirrors TitrationEngine logic so templates can preview without RPC.
   * opts: { acidConc, baseConc, acidVol, baseVol }  (volumes in mL)
   */
  function titrationPh(opts) {
    const acidConc = opts.acidConc;
    const baseConc = opts.baseConc;
    const acidVol = opts.acidVol;
    const baseVol = opts.baseVol || 0;

    const molesAcid = acidConc * (acidVol / 1000);
    const molesBase = baseConc * (baseVol / 1000);
    const totalVol = (acidVol + baseVol) / 1000;

    if (molesBase === 0) return -Math.log10(acidConc);
    if (Math.abs(molesBase - molesAcid) < 1e-4) return 7.0;
    if (molesBase < molesAcid) {
      return -Math.log10((molesAcid - molesBase) / totalVol);
    }
    const pOH = -Math.log10((molesBase - molesAcid) / totalVol);
    return Math.max(0, Math.min(14, 14 - pOH));
  }

  /* ---------- Kinetics / Thermodynamics ---------- */

  /**
   * reactionRateArrhenius — k = A · exp(-Ea / (R·T))
   * opts: { A, Ea, T }  (Ea in J/mol, T in K)
   */
  function reactionRateArrhenius(opts) {
    return opts.A * Math.exp(-opts.Ea / (R * opts.T));
  }

  /**
   * idealGasLaw — P = nRT/V  (P in atm when V in L, T in K)
   * opts: { n, T, V }
   */
  function idealGasLaw(opts) {
    if (!(opts.V > 0)) return 0;
    return (opts.n * R_ATM * opts.T) / opts.V;
  }

  /* ---------- Small Assorted Helpers ---------- */

  function concentration(moles, volumeL) {
    if (!(volumeL > 0)) return 0;
    return moles / volumeL;
  }

  function dilution(c1, v1, v2) {
    if (!(v2 > 0)) return 0;
    return (c1 * v1) / v2;
  }

  /* ---------- Basic self-asserts ---------- */

  const _tests = [];
  function assert(name, fn) { _tests.push({ name, fn }); }

  assert('phFromConcentration 0.1M HCl ≈ 1', () => {
    const ph = phFromConcentration(0.1);
    if (Math.abs(ph - 1) > 0.001) throw new Error('Expected ~1, got ' + ph);
  });
  assert('pohFromPh 7 → 7', () => {
    const poh = pohFromPh(7);
    if (Math.abs(poh - 7) > 0.001) throw new Error('Expected 7, got ' + poh);
  });
  assert('hFromPh 7 → 1e-7', () => {
    const h = hFromPh(7);
    if (Math.abs(h - 1e-7) > 1e-10) throw new Error('Expected 1e-7, got ' + h);
  });
  assert('titrationPh equivalence → 7', () => {
    const ph = titrationPh({ acidConc: 0.1, baseConc: 0.1, acidVol: 25, baseVol: 25 });
    if (Math.abs(ph - 7) > 0.01) throw new Error('Expected 7 at equivalence, got ' + ph);
  });
  assert('dilution C1V1=C2V2', () => {
    const c2 = dilution(1.0, 10, 100);
    if (Math.abs(c2 - 0.1) > 0.001) throw new Error('Expected 0.1, got ' + c2);
  });
  assert('idealGasLaw STP', () => {
    const p = idealGasLaw({ n: 1, T: 273.15, V: 22.4 });
    if (Math.abs(p - 1) > 0.05) throw new Error('Expected ~1 atm at STP, got ' + p);
  });

  function runTests() {
    const failures = [];
    _tests.forEach(t => { try { t.fn(); } catch (e) { failures.push(t.name + ': ' + e.message); } });
    if (failures.length) {
      console.error('[chemistry-utils] ' + failures.length + ' test(s) FAILED:\n  ' + failures.join('\n  '));
    } else {
      console.log('[chemistry-utils] All ' + _tests.length + ' tests passed.');
    }
  }

  window.EurekaChemistry = {
    R, R_ATM, Kw,
    phFromConcentration, pohFromPh, hFromPh, titrationPh,
    reactionRateArrhenius, idealGasLaw,
    concentration, dilution,
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('load', runTests);
  }
})();
