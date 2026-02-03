'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Lock, User, GraduationCap, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('') // Для отладки прямо на экране
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus('Проверка данных...')

    try {
      // 1. Сначала ищем в Преподавателях
      const { data: teachers } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('login', login)

      if (teachers && teachers.length > 0) {
        if (teachers[0].password === password) {
          setStatus('Вход выполнен (Преподаватель)')
          localStorage.setItem('user_role', 'teacher')
          localStorage.setItem('user_name', teachers[0].full_name)
          localStorage.setItem('teacher_id', teachers[0].id)
          return router.push('/teacher')
        }
      }

      // 2. Ищем в Студентах (registration_codes)
      const { data: students, error: sError } = await supabase
        .from('registration_codes')
        .select('*')
        .eq('code', login)

      if (sError) throw new Error("Ошибка базы: " + sError.message)

      if (students && students.length > 0) {
        const student = students[0]

        // Сравнение паролей (убедись, что в базе пароль совпадает с вводом)
        if (student.password?.trim() === password.trim()) {
          setStatus('Вход выполнен (Студент). Перенаправление...')

          localStorage.setItem('user_role', 'student')
          localStorage.setItem('user_name', student.full_name)
          localStorage.setItem('group_name', student.group_name || 'Не указана')
          localStorage.setItem('student_id', student.used_by)

          if (!student.is_password_changed) {
            console.log("Пароль не изменен, идем на /change-password")
            return router.push(`/change-password?code=${student.code}`)
          } else {
            console.log("Пароль изменен, идем в кабинет")
            return router.push('/dashboard')
          }
        } else {
          throw new Error('Неверный пароль')
        }
      } else {
        throw new Error('Пользователь с таким ИИН/Логином не найден')
      }

    } catch (err) {
      setStatus(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff] p-4 font-sans">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-purple-100 w-full max-w-md border border-purple-50">
        <div className="flex justify-center mb-6">
          <div className="bg-purple-600 p-4 rounded-3xl shadow-lg shadow-purple-200">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-800 text-center mb-2">Портал</h1>
        <p className="text-slate-400 text-center mb-8 text-sm">Введите ИИН студента или логин админа</p>

        {status && (
          <div className={`p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 border ${status.includes('Неверный') || status.includes('Ошибка')
              ? 'bg-red-50 text-red-600 border-red-100'
              : 'bg-purple-50 text-purple-600 border-purple-100'
            }`}>
            <AlertCircle className="w-5 h-5" />
            {status}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-300 w-5 h-5" />
            <input
              type="text"
              placeholder="Логин или ИИН"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 transition-all text-slate-700"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-300 w-5 h-5" />
            <input
              type="password"
              placeholder="Пароль"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 transition-all text-slate-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-purple-200 active:scale-95 disabled:bg-slate-200"
          >
            {loading ? 'Секунду...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}