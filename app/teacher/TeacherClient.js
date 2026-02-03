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

    // Остальной JSX и логика остаются без изменений, но используют state вместо прямого localStorage
    return (
        <div>
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Панель преподавателя</h1>
                    <p className="text-slate-400">Преподаватель: {teacherName}</p>
                </div>
                <button onClick={handleLogout} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut /> Выйти
                </button>
            </header>
            {/* Здесь ваш существующий интерфейс (табы, списки, формы) */}
        </div>
    )
}
