function normalCDF(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.821256 + t * 1.3302744))));
  return z > 0 ? 1 - p : p;
}

function zScore(p1, n1, p2, n2) {
  if (n1 === 0 || n2 === 0) return 0;
  const p = (p1 * n1 + p2 * n2) / (n1 + n2);
  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  if (se === 0) return 0;
  return (p1 - p2) / se;
}

function pValue(z) {
  return 2 * (1 - normalCDF(Math.abs(z)));
}

function computeStats(controlImp, controlConv, variantImp, variantConv) {
  const controlRate = controlImp > 0 ? controlConv / controlImp : 0;
  const variantRate = variantImp > 0 ? variantConv / variantImp : 0;
  const z = zScore(variantRate, variantImp, controlRate, controlImp);
  const pval = pValue(z);
  const confidence = (1 - pval) * 100;
  const improvement = controlRate === 0 ? 0 : ((variantRate - controlRate) / controlRate) * 100;
  return {
    controlRate: +(controlRate * 100).toFixed(2),
    variantRate: +(variantRate * 100).toFixed(2),
    zScore: +z.toFixed(3),
    pValue: +pval.toFixed(4),
    confidence: +confidence.toFixed(1),
    relativeImprovement: +improvement.toFixed(2),
    significant: pval < 0.05,
  };
}

module.exports = { computeStats };
