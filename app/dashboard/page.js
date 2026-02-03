'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { LogOut, BookOpen, Calendar, Star, Bell, AlertCircle, X } from 'lucide-react'
import {
    fetchHomeworksByGroup,
    fetchGradesByStudentId,
    calculateAverageGrade,
    getGradeColor
} from '@/lib/api/dataService'

export default function Dashboard() {
    const [user, setUser] = useState({ name: '', group: '', id: '' })
    const [loading, setLoading] = useState(true)
    const [homeworks, setHomeworks] = useState([])
    const [grades, setGrades] = useState([])
    const [averageGrade, setAverageGrade] = useState(0)
    const router = useRouter()

    // Модальные окна
    const [selectedHW, setSelectedHW] = useState(null)
    const [showGradesModal, setShowGradesModal] = useState(false)
    const [showStatsModal, setShowStatsModal] = useState(false)

    useEffect(() => {
        // 1. Проверяем данные из localStorage
        const role = localStorage.getItem('user_role')
        const name = localStorage.getItem('user_name')
        const group = localStorage.getItem('group_name')
        const studentId = localStorage.getItem('student_id')

        // 2. Если роли нет или это не студент — выкидываем на логин
        if (!role || role !== 'student' || !name) {
            console.log("Доступ запрещен или данные не найдены, уходим на логин...")
            router.push('/')
        } else {
            setUser({ name, group, id: studentId })
            fetchData(group, studentId)
        }
    }, [router])

    const fetchData = async (groupName, studentId) => {
        try {
            const [homeworksData, gradesData] = await Promise.all([
                fetchHomeworksByGroup(groupName),
                fetchGradesByStudentId(studentId)
            ])

            setHomeworks(homeworksData)
            setGrades(gradesData)

            const avg = calculateAverageGrade(gradesData)
            setAverageGrade(avg)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
                <div className="text-purple-600 font-medium animate-pulse">Загрузка кабинета...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f8f9ff] font-sans">
            {/* Шапка */}
            <nav className="bg-white border-b border-purple-50 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-600 p-2 rounded-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">Портал Студента</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-slate-800">{user.name}</div>
                        <div className="text-xs text-purple-500 font-medium">Группа: {user.group}</div>
                    </div>
                    <button
                        onClick={() => { localStorage.clear(); router.push('/'); }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            {/* Основной контент */}
            <main className="p-6 max-w-7xl mx-auto space-y-8">

                {/* Приветствие */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-purple-200">
                    <h2 className="text-3xl font-bold mb-2">Рады видеть тебя, {user.name.split(' ')[0]}! 👋</h2>
                    <p className="opacity-80">Твой учебный план на сегодня готов. Проверь расписание и задания.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Колонка 1: Домашнее задание */}
                    <div className="bg-white p-6 rounded-[2rem] border border-purple-50 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Calendar className="text-purple-500" />
                            <h3 className="text-lg font-bold text-slate-800">Домашнее задание</h3>
                        </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {homeworks.length > 0 ? (
                                homeworks.map(hw => (
                                    <div
                                        key={hw.id}
                                        onClick={() => setSelectedHW(hw)}
                                        className="p-4 bg-slate-50 rounded-2xl border-l-4 border-purple-400 cursor-pointer hover:shadow-md hover:bg-purple-50 transition-all"
                                    >
                                        <div className="text-xs text-slate-400 font-bold mb-1">📚 {hw.subject}</div>
                                        <div className="font-bold text-slate-700">{hw.task_text.substring(0, 50)}...</div>
                                        <div className="text-xs text-slate-500 mt-2">📅 Срок: {hw.deadline}</div>
                                        <div className="text-xs text-slate-400 mt-1">👨‍🏫 {hw.teacher_name || 'Преподаватель'}</div>
                                        <div className="text-xs text-purple-600 font-bold mt-2">👉 Нажми для подробнее</div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                    <Bell className="w-12 h-12 mb-3 opacity-30" />
                                    <p className="text-center text-sm">На сегодня заданий нет</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Колонка 2: Оценки */}
                    <div className="bg-white p-6 rounded-[2rem] border border-purple-50 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Star className="text-orange-400" />
                                <h3 className="text-lg font-bold text-slate-800">Мои оценки</h3>
                            </div>
                            {grades.length > 0 && (
                                <button
                                    onClick={() => setShowGradesModal(true)}
                                    className="text-purple-600 hover:text-purple-800 font-bold text-sm"
                                >
                                    Подробнее →
                                </button>
                            )}
                        </div>

                        {grades.length > 0 ? (
                            <>
                                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-100 text-center">
                                    <div className="text-xs text-slate-500 font-bold mb-1">Средний балл</div>
                                    <div className="text-3xl font-black text-orange-500">{averageGrade}</div>
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {grades.slice(0, 5).map((grade, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                            <div className="text-sm font-bold text-slate-700">{grade.subject}</div>
                                            <div className={`px-3 py-1 rounded-full font-bold text-white text-sm ${getGradeColor(grade.grade_value)}`}>
                                                {grade.grade_value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <AlertCircle className="w-12 h-12 mb-3 opacity-30" />
                                <p className="text-center text-sm">Оценок пока нет</p>
                            </div>
                        )}
                    </div>

                    {/* Колонка 3: Статистика */}
                    <div className="bg-white p-6 rounded-[2rem] border border-purple-50 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Статистика</h3>
                            <button
                                onClick={() => setShowStatsModal(true)}
                                className="text-purple-600 hover:text-purple-800 font-bold text-sm"
                            >
                                Подробнее →
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 cursor-pointer hover:shadow-md transition-all">
                                <div className="text-xs text-blue-600 font-bold mb-1">Активные задания</div>
                                <div className="text-3xl font-black text-blue-600">{homeworks.length}</div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 cursor-pointer hover:shadow-md transition-all">
                                <div className="text-xs text-purple-600 font-bold mb-1">Оценок получено</div>
                                <div className="text-3xl font-black text-purple-600">{grades.length}</div>
                            </div>
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <div className="text-xs text-indigo-600 font-bold mb-1">Группа</div>
                                <div className="text-lg font-bold text-indigo-600">{user.group}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* МОДАЛЬНОЕ ОКНО: Подробнее о ДЗ */}
            {selectedHW && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto border border-purple-50">
                        <div className="flex justify-between items-center p-8 border-b border-purple-50 sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-slate-800">📚 {selectedHW.subject}</h2>
                            <button
                                onClick={() => setSelectedHW(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <X size={24} className="text-slate-600" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <div className="text-sm font-bold text-slate-500 mb-2">Описание задания:</div>
                                <div className="text-lg text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl">
                                    {selectedHW.task_text}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <div className="text-sm font-bold text-blue-600 mb-2">📅 Срок выполнения</div>
                                    <div className="text-lg font-bold text-blue-700">{selectedHW.deadline}</div>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                    <div className="text-sm font-bold text-purple-600 mb-2">👨‍🏫 Преподаватель</div>
                                    <div className="text-lg font-bold text-purple-700">{selectedHW.teacher_name || 'Не указан'}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedHW(null)}
                                className="w-full bg-purple-600 text-white font-bold py-3 rounded-2xl hover:bg-purple-700 transition-all"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* МОДАЛЬНОЕ ОКНО: Все оценки */}
            {showGradesModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto border border-purple-50">
                        <div className="flex justify-between items-center p-8 border-b border-purple-50 sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-slate-800">⭐ Все мои оценки</h2>
                            <button
                                onClick={() => setShowGradesModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <X size={24} className="text-slate-600" />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-100 text-center">
                                <div className="text-sm text-slate-500 font-bold mb-2">Средний балл</div>
                                <div className="text-4xl font-black text-orange-500">{averageGrade}</div>
                            </div>
                            <div className="space-y-3">
                                {grades.map((grade, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-slate-700">{grade.subject}</div>
                                                <div className="text-xs text-slate-500">📅 {new Date(grade.created_at).toLocaleDateString('ru-RU')}</div>
                                            </div>
                                            <div className={`px-4 py-2 rounded-full font-bold text-white text-lg ${getGradeColor(grade.grade_value)}`}>
                                                {grade.grade_value}
                                            </div>
                                        </div>
                                        {grade.comment && (
                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-slate-700">
                                                <div className="font-bold text-blue-600 mb-1">💬 Комментарий преподавателя:</div>
                                                <div>{grade.comment}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowGradesModal(false)}
                                className="w-full bg-purple-600 text-white font-bold py-3 rounded-2xl hover:bg-purple-700 transition-all mt-6"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* МОДАЛЬНОЕ ОКНО: Подробная статистика */}
            {showStatsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full border border-purple-50">
                        <div className="flex justify-between items-center p-8 border-b border-purple-50 sticky top-0 bg-white">
                            <h2 className="text-2xl font-bold text-slate-800">📊 Статистика</h2>
                            <button
                                onClick={() => setShowStatsModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                            >
                                <X size={24} className="text-slate-600" />
                            </button>
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                <div className="text-sm text-blue-600 font-bold mb-2">📋 Активные задания</div>
                                <div className="text-4xl font-black text-blue-600">{homeworks.length}</div>
                                <div className="text-xs text-blue-500 mt-2">Всего заданий от всех преподавателей</div>
                            </div>
                            <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                <div className="text-sm text-purple-600 font-bold mb-2">⭐ Оценок получено</div>
                                <div className="text-4xl font-black text-purple-600">{grades.length}</div>
                                <div className="text-xs text-purple-500 mt-2">Всего оценок в системе</div>
                            </div>
                            <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <div className="text-sm text-indigo-600 font-bold mb-2">👥 Моя группа</div>
                                <div className="text-2xl font-black text-indigo-600">{user.group}</div>
                                <div className="text-xs text-indigo-500 mt-2">Группа обучения</div>
                            </div>
                            {grades.length > 0 && (
                                <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                                    <div className="text-sm text-orange-600 font-bold mb-2">📈 Средний балл</div>
                                    <div className="text-4xl font-black text-orange-500">{averageGrade}</div>
                                    <div className="text-xs text-orange-500 mt-2">Среднее арифметическое оценок</div>
                                </div>
                            )}
                            <button
                                onClick={() => setShowStatsModal(false)}
                                className="w-full bg-purple-600 text-white font-bold py-3 rounded-2xl hover:bg-purple-700 transition-all"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}