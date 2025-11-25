export const AUSTRIAN_STATES = {
  1: "Wien",
  2: "Niederösterreich",
  3: "Oberösterreich",
  4: "Steiermark",
  5: "Burgenland",
  6: "Kärnten",
  7: "Salzburg",
  8: "Tirol",
  9: "Vorarlberg"
}

export function getStateNames(stateIds) {
  if (!Array.isArray(stateIds)) return [];
  return stateIds.map(id => AUSTRIAN_STATES[id]).filter(Boolean);
}