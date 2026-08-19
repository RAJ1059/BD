import {
  FiSearch, FiMapPin, FiTarget, FiShare2, FiUsers, FiLayout, FiCode, FiFigma, FiAward, FiImage,
  FiEdit3, FiMail, FiVideo, FiSmartphone, FiZap, FiMonitor, FiShield, FiCompass, FiCheckCircle,
  FiClock, FiPhone, FiUser, FiBriefcase, FiLinkedin, FiArrowRight, FiMessageSquare,
} from 'react-icons/fi'
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaWhatsapp } from 'react-icons/fa'

export const ICON_REGISTRY = {
  FiSearch, FiMapPin, FiTarget, FiShare2, FiUsers, FiLayout, FiCode, FiFigma, FiAward, FiImage,
  FiEdit3, FiMail, FiVideo, FiSmartphone, FiZap, FiMonitor, FiShield, FiCompass, FiCheckCircle,
  FiClock, FiPhone, FiUser, FiBriefcase, FiLinkedin, FiArrowRight, FiMessageSquare,
  FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaWhatsapp,
}

export const ICON_NAMES = Object.keys(ICON_REGISTRY)

export function getIcon(name, fallback = FiZap) {
  return ICON_REGISTRY[name] || fallback
}
