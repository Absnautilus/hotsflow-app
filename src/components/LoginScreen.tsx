import { FormEvent, useState } from 'react'
import { supabase } from '../core/client'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setError(signInError.message === 'Invalid login credentials'
        ? 'Email o password non corretti.'
        : 'Accesso non riuscito. Riprova.')
      setPending(false)
    }
  }

  return (
    <main className="login-screen">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand"><span className="mark">H</span><span>Hotsflow</span></div>
        <div className="login-copy">
          <p className="eyebrow">Workspace hotel</p>
          <h1 id="login-title">Accedi</h1>
          <p>Un unico accesso per i tuoi strumenti operativi.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <p className="login-error" role="alert">{error}</p> : null}
          <button className="login-submit" type="submit" disabled={pending}>
            {pending ? 'Accesso…' : 'Accedi'}
          </button>
        </form>
      </section>
    </main>
  )
}
