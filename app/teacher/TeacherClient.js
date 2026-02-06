'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { BookOpen, Star, PlusCircle, LogOut, Trash2, Users, Edit2, X } from 'lucide-react'
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
    const [showEditModal, setShowEditModal] = useState(false)
    const [studentFilter, setStudentFilter] = useState('')
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
            console.log('Загруженные студенты:', data)
            if (data && data.length > 0) {
                console.log('Первый студент структура:', data[0])
                console.log('Все used_by значения:', data.map(s => ({ used_by: s.used_by, full_name: s.full_name })))
            }
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
        console.log('Загруженные оценки:', data)
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

        console.log('handleAddGrade вызван с selectedStudentName:', selectedStudentName)

        // Валидация оценки
        const gradeNum = parseInt(grade, 10)
        if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 100) {
            return alert("Оценка должна быть целым числом от 1 до 100")
        }

        setLoading(true)
        try {
            // Получаем объект студента по индексу
            const studentIndex = parseInt(selectedStudent, 10)
            const selectedStudentObj = allStudents[studentIndex]
            const studentName = selectedStudentObj?.full_name || selectedStudentObj?.name || selectedStudentName || 'Неизвестный студент'
            const studentId = selectedStudentObj?.used_by || selectedStudentObj?.id || selectedStudent

            console.log('Отправляем оценку:', { student_id: studentId, student_name: studentName, group_name: group, subject, grade_value: gradeNum })
            const result = await createGrade({
                student_id: studentId,
                student_name: studentName,
                group_name: group,
                subject,
                grade_value: gradeNum,
                comment: gradeComment,
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
        setShowEditModal(true)
    }

    const closeEditModal = () => {
        setShowEditModal(false)
        setEditingGradeId(null)
        setEditingGradeValue('')
        setEditingGradeComment('')
    }


    const handleUpdateGrade = async () => {
        if (!editingGradeId) return

        // Валидация оценки
        const gradeNum = parseInt(editingGradeValue, 10)
        if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 100) {
            return alert("Оценка должна быть целым числом от 1 до 100")
        }

        setLoading(true)
        try {
            const result = await updateGrade(editingGradeId, gradeNum, editingGradeComment)
            if (result.success) {
                alert('Оценка обновлена')
                closeEditModal()
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
                                className="w-full p-3 sm:p-4 mb-3 sm:mb-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 text-sm sm:text-base text-slate-700"
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
                                    const studentIndex = parseInt(e.target.value, 10)
                                    console.log('Выбран студент индекс:', studentIndex)

                                    const selected = allStudents[studentIndex]
                                    console.log('Найденный студент:', selected)

                                    if (selected) {
                                        setSelectedStudent(studentIndex)
                                        const studentName = selected.full_name || selected.name || 'Неизвестный студент'
                                        console.log('Установлено имя студента:', studentName)
                                        setSelectedStudentName(studentName)
                                    } else {
                                        console.warn('Студент не найден по индексу')
                                        setSelectedStudent('')
                                        setSelectedStudentName('')
                                    }
                                }}
                                className="w-full p-3 sm:p-4 mb-3 sm:mb-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 text-slate-900 text-sm sm:text-base"
                            >
                                <option value="">Выбрать студента...</option>
                                {allStudents.map((s, index) => (
                                    <option key={index} value={index}>
                                        {s.full_name || s.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="number"
                                placeholder="Баллы (1-100)"
                                min="1"
                                max="100"
                                step="1"
                                className="w-full p-3 sm:p-4 mb-3 sm:mb-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 text-slate-900 text-sm sm:text-base"
                                value={grade}
                                onChange={e => {
                                    const value = e.target.value
                                    if (value === '') {
                                        setGrade('')
                                    } else {
                                        const num = parseInt(value, 10)
                                        if (!isNaN(num) && num >= 1 && num <= 100) {
                                            setGrade(value)
                                        }
                                    }
                                }}
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
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-purple-600">История оценок</h2>
                                <input
                                    type="text"
                                    placeholder="Фильтр по имени студента..."
                                    value={studentFilter}
                                    onChange={e => setStudentFilter(e.target.value)}
                                    className="px-3 sm:px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-purple-500 transition-all"
                                />
                            </div>
                            <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                                {grades.filter(g =>
                                    (g.student_name || g.student_id).toLowerCase().includes(studentFilter.toLowerCase())
                                ).length > 0 ? (
                                    grades
                                        .filter(g => (g.student_name || g.student_id).toLowerCase().includes(studentFilter.toLowerCase()))
                                        .map((g) => (
                                            <div key={g.id} className="p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-2xl border border-slate-200">
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 sm:gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-slate-800 text-sm sm:text-base">{g.subject}</div>
                                                        <div className="text-xs sm:text-sm text-slate-600 truncate">Студент: {g.student_name || 'Неизвестный студент'}</div>
                                                        <div className="text-xs text-slate-400">Дата: {new Date(g.created_at).toLocaleDateString('ru-RU')}</div>
                                                    </div>
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
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <p className="text-center text-slate-400 py-4 text-sm sm:text-base">
                                        {studentFilter ? 'Оценок не найдено' : 'Нет оценок'}
                                    </p>
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

            {/* Модальное окно редактирования оценки */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">Редактировать оценку</h2>
                            <button
                                onClick={closeEditModal}
                                className="text-slate-400 hover:text-slate-600 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {/* Grade input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Оценка (1-100)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    step="1"
                                    value={editingGradeValue}
                                    onChange={e => {
                                        const value = e.target.value
                                        if (value === '') {
                                            setEditingGradeValue('')
                                        } else {
                                            const num = parseInt(value, 10)
                                            if (!isNaN(num) && num >= 1 && num <= 100) {
                                                setEditingGradeValue(value)
                                            }
                                        }
                                    }}
                                    className="w-full p-3 bg-white border-2 border-slate-300 rounded-lg text-center text-slate-900 text-lg font-bold focus:border-purple-500 focus:outline-none transition-all"
                                />
                            </div>

                            {/* Comment input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Комментарий</label>
                                <textarea
                                    placeholder="Введите комментарий к оценке..."
                                    value={editingGradeComment}
                                    onChange={e => setEditingGradeComment(e.target.value)}
                                    className="w-full p-3 bg-white border-2 border-slate-300 rounded-lg text-sm resize-none h-24 text-slate-900 focus:border-purple-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 p-6 border-t border-slate-200">
                            <button
                                onClick={closeEditModal}
                                className="flex-1 bg-slate-200 text-slate-800 px-4 py-3 rounded-lg hover:bg-slate-300 transition-all font-bold"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleUpdateGrade}
                                disabled={loading}
                                className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-all font-bold disabled:opacity-50"
                            >
                                {loading ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}