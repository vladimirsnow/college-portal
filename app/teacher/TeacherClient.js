'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { BookOpen, Star, PlusCircle, LogOut, Trash2, Users, Edit2 } from 'lucide-react'
import {
    fetchAllGroups,
    fetchStudentsByGroup,
    fetchHomeworksByGroup,
    fetchGradesByGroup,
    fetchTeacherSubjects,
    createHomework,
    createGrade,
    updateGrade,
    deleteHomework,
    deleteGrade,
    getGradeColor
} from '@/lib/api/dataService'

export default function TeacherClient() {
    const [task, setTask] = useState('')
    const [group, setGroup] = useState('')
    const [groups, setGroups] = useState([])
    const [subject, setSubject] = useState('')
    const [deadline, setDeadline] = useState('')
    const [students, setStudents] = useState([])
    const [allStudents, setAllStudents] = useState([])
    const [selectedStudent, setSelectedStudent] = useState('')
    const [selectedStudentName, setSelectedStudentName] = useState('')
    const [grade, setGrade] = useState('')
    const [gradeComment, setGradeComment] = useState('')
    const [grades, setGrades] = useState([])
    const [homeworks, setHomeworks] = useState([])
    const [activeTab, setActiveTab] = useState('homework')
    const [loading, setLoading] = useState(false)
    const [subjects, setSubjects] = useState([])
    const [editingGradeId, setEditingGradeId] = useState(null)
    const [editingGradeValue, setEditingGradeValue] = useState('')
    const [editingGradeComment, setEditingGradeComment] = useState('')
    const router = useRouter()
    const [teacherId, setTeacherId] = useState(null)
    const [teacherName, setTeacherName] = useState('')

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (localStorage.getItem('user_role') !== 'teacher') {
            router.push('/')
        } else {
            const tid = localStorage.getItem('teacher_id')
            const name = localStorage.getItem('user_name')
            setTeacherId(tid)
            setTeacherName(name || '')
            loadGroups()
            loadSubjects(tid)
        }
    }, [router])

    useEffect(() => {
        if (group) {
            fetchAllData()
        }
    }, [group])

    const loadGroups = async () => {
        setLoading(true)
        try {
            const groupsList = await fetchAllGroups()
            setGroups(groupsList)
            if (groupsList.length > 0) {
                setGroup(groupsList[0])
            }
        } finally {
            setLoading(false)
        }
    }

    const loadSubjects = async (tid) => {
        try {
            if (!tid) {
                console.error('teacher_id не найден!')
                return
            }
            const subjectsList = await fetchTeacherSubjects(tid)
            setSubjects(subjectsList)
            if (subjectsList.length > 0) {
                setSubject(subjectsList[0].subject)
            }
        } catch (error) {
            console.error('Ошибка при загрузке предметов:', error)
        }
    }

    const fetchAllData = async () => {
        await Promise.all([
            fetchStudentsList(),
            fetchHomeworksList(),
            fetchGradesList()
        ])
    }

    async function fetchStudentsList() {
        setLoading(true)
        try {
            const data = await fetchStudentsByGroup(group)
            setStudents(data)
            setAllStudents(data)
        } finally {
            setLoading(false)
        }
    }

    async function fetchHomeworksList() {
        const data = await fetchHomeworksByGroup(group)
        setHomeworks(data)
    }

    async function fetchGradesList() {
        const data = await fetchGradesByGroup(group)
        setGrades(data)
    }

    const handleAddHW = async () => {
        if (!subject || !task || !deadline) return alert("Заполните все поля ДЗ")
        setLoading(true)
        try {
            const result = await createHomework({
                group_name: group,
                subject,
                task_text: task,
                teacher_name: teacherName,
                deadline: deadline
            })
            if (result.success) {
                alert("ДЗ опубликовано!");
                setTask('');
                setSubject('');
                setDeadline('');
                await fetchHomeworksList();
            } else {
                alert("Ошибка: " + result.error)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleAddGrade = async () => {
        if (!selectedStudent || !grade || !subject) return alert("Заполните все поля")
        setLoading(true)
        try {
            const result = await createGrade({
                student_id: selectedStudent,
                group_name: group,
                subject,
                grade_value: parseInt(grade, 10),
                teacher_name: teacherName
            })
            if (result.success) {
                alert('Оценка добавлена')
                setGrade('')
                setGradeComment('')
                await fetchGradesList()
            } else {
                alert('Ошибка: ' + result.error)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.clear()
        }
        router.push('/')
    }

    const handleDeleteHW = async (id) => {
        if (!confirm('Удалить это задание?')) return
        setLoading(true)
        try {
            const result = await deleteHomework(id)
            if (result.success) {
                alert('ДЗ удалено')
                await fetchHomeworksList()
            } else {
                alert('Ошибка: ' + result.error)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteGrade = async (id) => {
        if (!confirm('Удалить эту оценку?')) return
        setLoading(true)
        try {
            const result = await deleteGrade(id)
            if (result.success) {
                alert('Оценка удалена')
                await fetchGradesList()
            } else {
                alert('Ошибка: ' + result.error)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleEditGrade = (id, value, comment) => {
        setEditingGradeId(id)
        setEditingGradeValue(value)
        setEditingGradeComment(comment)
    }

    const handleUpdateGrade = async () => {
        if (!editingGradeId) return
        setLoading(true)
        try {
            const result = await updateGrade(editingGradeId, parseInt(editingGradeValue, 10), editingGradeComment)
            if (result.success) {
                alert('Оценка обновлена')
                setEditingGradeId(null)
                await fetchGradesList()
            } else {
                alert('Ошибка: ' + result.error)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <div className="bg-purple-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl flex-shrink-0">
                            <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">Панель преподавателя</h1>
                            <p className="text-xs sm:text-sm text-slate-500 truncate">Преподаватель: {teacherName || 'Загрузка...'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 text-red-600 hover:bg-red-50 rounded-lg sm:rounded-2xl transition-all font-bold text-sm sm:text-base flex-shrink-0"
                    >
                        <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Выйти</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
                {/* Выбор группы */}
                <div className="mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100">
                    <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-2 sm:mb-3">Выберите группу:</label>
                    {groups.length > 0 ? (
                        <select
                            value={group}
                            onChange={e => setGroup(e.target.value)}
                            className="w-full p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-purple-300 font-bold text-sm sm:text-base text-slate-900"
                        >
                            {groups.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl sm:rounded-2xl text-yellow-700 text-xs sm:text-sm">
                            Нет групп в базе данных. Добавьте студентов в группы.
                        </div>
                    )}
                </div>

                {/* Табы */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 bg-white p-2 rounded-xl sm:rounded-2xl w-full sm:w-fit border border-slate-100 ">
                    {['homework', 'grades', 'students'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all flex-1 sm:flex-none ${activeTab === tab
                                ? 'bg-purple-600 text-white'
                                : 'text-slate-600 hover:text-slate-800'
                                }`}
                        >
                            <span className="hidden sm:inline">
                                {tab === 'homework' && '📚 Домашние задания'}
                                {tab === 'grades' && '⭐ Оценки'}
                                {tab === 'students' && '👥 Студенты'}
                            </span>
                            <span className="sm:hidden">
                                {tab === 'homework' && '📚'}
                                {tab === 'grades' && '⭐'}
                                {tab === 'students' && '👥'}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Вкладка: Домашние задания */}
                {activeTab === 'homework' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {/* Форма добавления ДЗ */}
                        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 h-fit">
                            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 text-purple-600">
                                <PlusCircle size={20} className="sm:w-6 sm:h-6" />
                                <h2 className="text-lg sm:text-xl font-bold">Новое задание</h2>
                            </div>

                            <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1 sm:mb-2">Выберите предмет:</label>
                            <select
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="w-full p-3 sm:p-4 mb-3 sm:mb-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 text-sm sm:text-base"
                            >
                                <option value="">Выбрать предмет...</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.subject}>{s.subject}</option>
                                ))}
                            </select>

                            <textarea
                                placeholder="Описание задания..."
                                className="w-full p-3 sm:p-4 mb-3 sm:mb-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 h-24 sm:h-40 text-slate-900 text-sm sm:text-base"
                                value={task}
                                onChange={e => setTask(e.target.value)}
                            />

                            <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1 sm:mb-2">Срок выполнения:</label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={e => setDeadline(e.target.value)}
                                className="w-full p-3 sm:p-4 mb-3 sm:mb-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 text-slate-900 text-sm sm:text-base"
                            />

                            <button
                                onClick={handleAddHW}
                                disabled={loading}
                                className="w-full bg-purple-600 text-white font-bold py-3 sm:py-4 rounded-lg sm:rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-50 text-sm sm:text-base"
                            >
                                {loading ? 'Публикация...' : 'Опубликовать ДЗ'}
                            </button>
                        </div>

                        {/* Список ДЗ */}
                        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100">
                            <h2 className="text-lg sm:text-xl font-bold text-purple-600 mb-4 sm:mb-6">Актуальные задания</h2>
                            <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                                {homeworks.length > 0 ? (
                                    homeworks.map(hw => (
                                        <div key={hw.id} className="p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-2xl border border-slate-200">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-purple-600 text-sm sm:text-base">{hw.subject}</div>
                                                    <div className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2 line-clamp-2">{hw.task_text}</div>
                                                    <div className="text-xs text-slate-400 mt-1 sm:mt-2">Срок: {hw.deadline}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteHW(hw.id)}
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all flex-shrink-0"
                                                >
                                                    <Trash2 size={16} className="sm:w-5 sm:h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 py-4 text-sm sm:text-base">Нет заданий</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Вкладка: Оценки */}
                {activeTab === 'grades' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {/* Форма выставления оценок */}
                        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 h-fit">
                            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 text-purple-600">
                                <Star size={20} className="sm:w-6 sm:h-6" />
                                <h2 className="text-lg sm:text-xl font-bold">Выставить оценку</h2>
                            </div>

                            <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1 sm:mb-2">Выберите предмет:</label>
                            <select
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="w-full p-3 sm:p-4 mb-3 sm:mb-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 text-slate-900 text-sm sm:text-base"
                            >
                                <option value="">Выбрать предмет...</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.subject}>{s.subject}</option>
                                ))}
                            </select>

                            <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1 sm:mb-2">Выберите студента:</label>
                            <select
                                value={selectedStudent}
                                onChange={e => {
                                    const selected = allStudents.find(s => s.used_by === e.target.value)
                                    setSelectedStudent(e.target.value)
                                    setSelectedStudentName(selected?.full_name || '')
                                }}
                                className="w-full p-3 sm:p-4 mb-3 sm:mb-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 text-slate-900 text-sm sm:text-base"
                            >
                                <option value="">Выбрать студента...</option>
                                {allStudents.map(s => (
                                    <option key={s.used_by} value={s.used_by}>
                                        {s.full_name}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                placeholder="Баллы (1-100)"
                                min="1"
                                max="100"
                                className="w-full p-3 sm:p-4 mb-3 sm:mb-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 text-slate-900 text-sm sm:text-base"
                                value={grade}
                                onChange={e => setGrade(e.target.value)}
                            />

                            <label className="block text-xs sm:text-sm font-bold text-slate-600 mb-1 sm:mb-2">Комментарий (опционально):</label>
                            <textarea
                                placeholder="Добавь комментарий к оценке..."
                                className="w-full p-3 sm:p-4 mb-3 sm:mb-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 h-20 sm:h-24 resize-none text-slate-900 text-sm sm:text-base"
                                value={gradeComment}
                                onChange={e => setGradeComment(e.target.value)}
                            />

                            <button
                                onClick={handleAddGrade}
                                disabled={loading}
                                className="w-full bg-slate-800 text-white font-bold py-3 sm:py-4 rounded-lg sm:rounded-2xl hover:bg-slate-900 transition-all shadow-lg disabled:opacity-50 text-sm sm:text-base"
                            >
                                {loading ? 'Сохранение...' : 'Выставить оценку'}
                            </button>
                        </div>

                        {/* История оценок */}
                        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100">
                            <h2 className="text-lg sm:text-xl font-bold text-purple-600 mb-4 sm:mb-6">История оценок</h2>
                            <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                                {grades.length > 0 ? (
                                    grades.map((g) => (
                                        <div key={g.id} className="p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-2xl border border-slate-200">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 sm:gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-800 text-sm sm:text-base">{g.subject}</div>
                                                    <div className="text-xs sm:text-sm text-slate-600 truncate">Студент: {g.student_id}</div>
                                                    <div className="text-xs text-slate-400">Дата: {new Date(g.created_at).toLocaleDateString('ru-RU')}</div>
                                                </div>
                                                {editingGradeId === g.id ? (
                                                    <div className="w-full flex flex-col gap-2 mt-2 sm:mt-0">
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="100"
                                                                value={editingGradeValue}
                                                                onChange={e => setEditingGradeValue(e.target.value)}
                                                                className="flex-1 p-2 bg-white border border-purple-200 rounded-lg text-center text-slate-900 text-sm"
                                                            />
                                                        </div>
                                                        <textarea
                                                            placeholder="Комментарий..."
                                                            value={editingGradeComment}
                                                            onChange={e => setEditingGradeComment(e.target.value)}
                                                            className="w-full p-2 bg-white border border-purple-200 rounded-lg text-sm resize-none h-16 text-slate-900"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleUpdateGrade}
                                                                disabled={loading}
                                                                className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-all text-xs sm:text-sm font-bold"
                                                            >
                                                                ✓ Сохранить
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingGradeId(null)}
                                                                className="flex-1 bg-gray-400 text-white px-3 py-2 rounded-lg hover:bg-gray-500 transition-all text-xs sm:text-sm font-bold"
                                                            >
                                                                ✕ Отмена
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 flex flex-col gap-2 mt-2 sm:mt-0">
                                                        <div className="flex gap-2 items-center justify-end sm:justify-start flex-wrap">
                                                            <div className={`text-base sm:text-lg font-bold text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg ${getGradeColor(g.grade_value)}`}>{g.grade_value}</div>
                                                            <button
                                                                onClick={() => handleEditGrade(g.id, g.grade_value, g.comment || '')}
                                                                className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                                                title="Редактировать"
                                                            >
                                                                <Edit2 size={16} className="sm:w-5 sm:h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteGrade(g.id)}
                                                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                                title="Удалить"
                                                            >
                                                                <Trash2 size={16} className="sm:w-5 sm:h-5" />
                                                            </button>
                                                        </div>
                                                        {g.comment && (
                                                            <div className="text-xs text-slate-600 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                                                                💬 {g.comment}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-400 py-4 text-sm sm:text-base">Нет оценок</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Вкладка: Студенты */}
                {activeTab === 'students' && (
                    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100">
                        <h2 className="text-lg sm:text-xl font-bold text-purple-600 mb-4 sm:mb-6">Студенты группы {group}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {allStudents.length > 0 ? (
                                allStudents.map(student => (
                                    <div key={student.used_by} className="p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-2xl border border-slate-200">
                                        <div className="font-bold text-slate-800 text-sm sm:text-base truncate">{student.full_name}</div>
                                        <div className={`text-xs mt-2 px-2 sm:px-3 py-1 rounded-full font-bold inline-block ${student.used_by ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {student.used_by ? '✓ Зарег.' : '○ Не зарег.'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-full text-center text-slate-400 py-6 sm:py-8 text-sm sm:text-base">Нет студентов в группе</p>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
