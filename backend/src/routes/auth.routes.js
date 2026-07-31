import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/auth.js'
import { authLimiter } from '../middlewares/rateLimiter.js'
import { validate } from '../middlewares/validate.js'
import {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  verifyTwoFactorValidator,
  googleLoginValidator,
  registerValidator,
} from '../validators/auth.validators.js'

const router = Router()

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               rememberMe: { type: boolean }
 *               twoFactorCode: { type: string, description: "Required only if 2FA is enabled on the account" }
 *     responses:
 *       200:
 *         description: Access token + user profile, or a two-factor challenge
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, loginValidator, validate, authController.login)

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Self-register a new client account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       201: { description: Account created, access token + user profile }
 *       400: { description: Email already registered }
 */
router.post('/register', authLimiter, registerValidator, validate, authController.register)

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate the refresh token (from the httpOnly cookie) for a new access token
 *     security: []
 *     responses:
 *       200: { description: New access token issued }
 *       401: { description: Refresh session invalid or expired }
 */
router.post('/refresh', authController.refresh)

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke the current session's refresh token
 *     security: []
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', authController.logout)

/**
 * @openapi
 * /auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in with a Google ID token; auto-registers a Client account on first sign-in (requires GOOGLE_CLIENT_ID configured)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken: { type: string }
 *     responses:
 *       200: { description: Access token + user profile }
 *       501: { description: Google login not configured }
 */
router.post('/google', authLimiter, googleLoginValidator, validate, authController.googleLogin)

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: Generic confirmation (does not reveal whether the email exists) }
 */
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, authController.forgotPassword)

/**
 * @openapi
 * /auth/reset-password/{token}:
 *   post:
 *     tags: [Auth]
 *     summary: Reset a password using the emailed token
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, format: password }
 *     responses:
 *       200: { description: Password reset successful }
 *       400: { description: Token invalid or expired }
 */
router.post('/reset-password/:token', authLimiter, resetPasswordValidator, validate, authController.resetPassword)

router.use(authenticate)

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current authenticated user's profile
 *     responses:
 *       200: { description: Current user }
 */
router.get('/me', authController.me)

/**
 * @openapi
 * /auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke all refresh tokens (sign out of every device)
 *     responses:
 *       200: { description: Signed out everywhere }
 */
router.post('/logout-all', authController.logoutAll)

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password while authenticated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password }
 *     responses:
 *       200: { description: Password changed }
 *       400: { description: Current password incorrect }
 */
router.post('/change-password', changePasswordValidator, validate, authController.changePassword)

/**
 * @openapi
 * /auth/login-history:
 *   get:
 *     tags: [Auth]
 *     summary: List this user's recent login attempts (success and failure)
 *     responses:
 *       200: { description: Login history }
 */
router.get('/login-history', authController.loginHistory)

/**
 * @openapi
 * /auth/devices:
 *   get:
 *     tags: [Auth]
 *     summary: List active devices/sessions for this user
 *     responses:
 *       200: { description: Active devices }
 */
router.get('/devices', authController.listDevices)

/**
 * @openapi
 * /auth/devices/{id}:
 *   delete:
 *     tags: [Auth]
 *     summary: Revoke a device/session (signs it out)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Device signed out }
 *       404: { description: Device not found }
 */
router.delete('/devices/:id', authController.revokeDevice)

/**
 * @openapi
 * /auth/2fa/setup:
 *   post:
 *     tags: [Auth]
 *     summary: Start TOTP 2FA setup (returns a QR code to scan)
 *     responses:
 *       200: { description: QR code + base32 secret }
 */
router.post('/2fa/setup', authController.setupTwoFactor)

/**
 * @openapi
 * /auth/2fa/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verify the 6-digit TOTP code and enable 2FA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, minLength: 6, maxLength: 6 }
 *     responses:
 *       200: { description: 2FA enabled, returns one-time backup codes }
 *       400: { description: Invalid code }
 */
router.post('/2fa/verify', verifyTwoFactorValidator, validate, authController.verifyTwoFactor)

/**
 * @openapi
 * /auth/2fa/disable:
 *   post:
 *     tags: [Auth]
 *     summary: Disable 2FA for this account
 *     responses:
 *       200: { description: 2FA disabled }
 */
router.post('/2fa/disable', authController.disableTwoFactor)

export default router
