export function equalsId(a, b) {
  if (!a || !b) return false;
  try {
    // if either has toString, compare strings
    return a.toString() === b.toString();
  } catch (e) {
    return false;
  }
}

export default equalsId;
