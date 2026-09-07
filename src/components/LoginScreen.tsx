import { FormEvent, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../core/client'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

    if (signInError) {
      setError(signInError.message === 'Invalid login credentials' ? 'Email o password non corretti.' : 'Accesso non riuscito. Riprova.')
      setPending(false)
    }
  }

  return (
    <main className="login-screen">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand"><span className="mark">H</span><span>Hotsflow</span></div>
        <div className="login-copy">
          <p className="eyebrow">Workspace hotel</p>
          <h1 id="login-title">Bentornato</h1>
          <p>Accedi al tuo spazio di lavoro Hotsflow.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus />
          </label>
          <label>
            <span>Password</span>
            <span className="password-field">
              <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button type="button" aria-label={showPassword ? 'Nascondi password' : 'Mostra password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </span>
          </label>
          {error ? <p className="login-error" role="alert">{error}</p> : null}
          <button className="login-submit" type="submit" disabled={pending}>{pending ? 'Accesso…' : 'Accedi'}</button>
          <p className="login-help">Problemi ad accedere? <span>Contatta l'amministratore della struttura.</span></p>
        </form>
      </section>
    </main>
  )
}
