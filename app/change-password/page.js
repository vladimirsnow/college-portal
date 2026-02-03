'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

function ChangePasswordContent() {
  const [pass1, setPass1] = useState('')
  const [pass2, setPass2] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentCode, setCurrentCode] = useState(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    console.log("URL Code Check:", codeFromUrl) // Проверка в консоли (F12)
    if (codeFromUrl) {
      setCurrentCode(codeFromUrl)
    }
  }, [searchParams])

  const handleChange = async (e) => {
    e.preventDefault()

    if (!currentCode) return alert("Ошибка: ИИН не найден!")
    if (pass1 !== pass2) return alert("Пароли не совпадают!")
    if (pass1.length < 6) return alert("Пароль должен быть не менее 6 символов!")

    setLoading(true)

    try {
      console.log("Attempting update for:", currentCode)

      const { data, error } = await supabase
        .from('registration_codes')
        .update({
          password: pass1,
          is_password_changed: true
        })
        .eq('code', currentCode) // Фильтр по ИИН
        .select() // Просим вернуть измененные данные

      if (error) throw error

      if (data && data.length === 0) {
        throw new Error("Запись с таким ИИН не найдена в базе!")
      }

      console.log("Success update:", data)
      alert("✅ Пароль успешно изменен! Войдите под новым паролем.")
      router.push('/')
    } catch (error) {
      console.error("Supabase Error:", error)
      alert("Ошибка: " + (error.message || "Неизвестная ошибка"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-purple-600">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">Установка пароля</h2>
        <p className="text-slate-500 mb-6 text-sm text-center">
          Придумайте пароль для ИИН: <span className="font-bold text-purple-600">{currentCode || "загрузка..."}</span>
        </p>

        <form onSubmit={handleChange} className="space-y-4">
          <input
            type="password"
            placeholder="Новый пароль"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800"
            value={pass1}
            onChange={(e) => setPass1(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Повторите пароль"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading || !currentCode}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${loading ? 'bg-purple-300' : 'bg-purple-600 hover:bg-purple-700'
              }`}
          >
            {loading ? 'Сохранение...' : 'Подтвердить смену'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <ChangePasswordContent />
    </Suspense>
  )
}