export function buildMongoQuery(node) {
  if (!node) return {};
  if (node.op === "AND") return { $and: node.rules.map(buildMongoQuery) };
  if (node.op === "OR") return { $or: node.rules.map(buildMongoQuery) };

  const { field, cmp, value } = node;
  switch (cmp) {
    case ">": return { [field]: { $gt: value } };
    case "<": return { [field]: { $lt: value } };
    case ">=": return { [field]: { $gte: value } };
    case "<=": return { [field]: { $lte: value } };
    case "==": return { [field]: value };
    case "in": return { [field]: { $in: value } };
    case "inactive_days_gt": {
      const date = new Date();
      date.setDate(date.getDate() - value);
      return { lastOrderAt: { $lt: date } };
    }
    default: return {};
  }
}
