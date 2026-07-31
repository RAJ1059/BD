import { GoogleLogin } from '@react-oauth/google'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function GoogleAuthButton({ onSuccess, onError, text = 'continue_with' }) {
  if (!googleClientId) return null

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={(credentialResponse) => onSuccess(credentialResponse.credential)}
        onError={() => onError?.('Google sign-in failed. Please try again.')}
        theme="filled_black"
        shape="pill"
        text={text}
        width="320"
      />
    </div>
  )
}
