import { IpRule } from '../models/IpRule.js'

// Naive matching: exact IP match, or a prefix match for simple
// CIDR-like patterns (e.g. rule "1.2.3." matches "1.2.3.4"). This is not
// real CIDR subnet math — if precise subnet matching is needed later, use a
// library such as `ip-cidr`.
function matches(ruleIp, requestIp) {
  if (!requestIp) return false
  if (ruleIp === requestIp) return true
  if (ruleIp.endsWith('.') && requestIp.startsWith(ruleIp)) return true
  return false
}

// Blocks/allows requests based on active IpRule documents. Fails open on any
// DB error so a Mongo hiccup never takes the whole site down.
export async function ipFilter(req, res, next) {
  try {
    const rules = await IpRule.find({ isActive: true })
    if (!rules.length) return next()

    const blockRules = rules.filter((r) => r.type === 'block')
    const allowRules = rules.filter((r) => r.type === 'allow')

    if (blockRules.some((r) => matches(r.ip, req.ip))) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    if (allowRules.length && !allowRules.some((r) => matches(r.ip, req.ip))) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    return next()
  } catch {
    return next()
  }
}
