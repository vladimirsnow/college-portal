import { supabase } from '@/lib/supabaseClient'

// ===== HOMEWORKS =====
export async function fetchHomeworksByGroup(groupName) {
    try {
        const { data, error } = await supabase
            .from('homeworks')
            .select('*')
            .eq('group_name', groupName)
            .order('deadline', { ascending: true })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Ошибка при загрузке ДЗ:', error.message)
        return []
    }
}

export async function createHomework(homework) {
    try {
        const { data, error } = await supabase
            .from('homeworks')
            .insert([{
                ...homework,
                created_at: new Date().toISOString(),
            }])
            .select()

        if (error) throw error
        return { success: true, data: data[0] }
    } catch (error) {
        console.error('Ошибка при создании ДЗ:', error.message)
        return { success: false, error: error.message }
    }
}

export async function deleteHomework(id) {
    try {
        const { error } = await supabase
            .from('homeworks')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error('Ошибка при удалении ДЗ:', error.message)
        return { success: false, error: error.message }
    }
}

// ===== GRADES =====
export async function fetchGradesByStudentId(studentId) {
    try {
        const { data, error } = await supabase
            .from('grades')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Ошибка при загрузке оценок:', error.message)
        return []
    }
}

export async function fetchGradesByGroup(groupName) {
    try {
        const { data, error } = await supabase
            .from('grades')
            .select('*')
            .eq('group_name', groupName)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Ошибка при загрузке оценок группы:', error.message)
        return []
    }
}

export async function createGrade(grade) {
    try {
        const { data, error } = await supabase
            .from('grades')
            .insert([{
                ...grade,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }])
            .select()

        if (error) throw error
        return { success: true, data: data[0] }
    } catch (error) {
        console.error('Ошибка при добавлении оценки:', error.message)
        return { success: false, error: error.message }
    }
}

export async function updateGrade(gradeId, gradeValue, comment = '') {
    try {
        const { data, error } = await supabase
            .from('grades')
            .update({
                grade_value: gradeValue,
                comment: comment,
                updated_at: new Date().toISOString(),
            })
            .eq('id', gradeId)
            .select()

        if (error) throw error
        return { success: true, data: data[0] }
    } catch (error) {
        console.error('Ошибка при обновлении оценки:', error.message)
        return { success: false, error: error.message }
    }
}

// ===== GROUPS =====
export async function fetchAllGroups() {
    try {
        const { data, error } = await supabase
            .from('registration_codes')
            .select('group_name')
            .not('group_name', 'is', null)

        if (error) throw error

        // Удаляем дубликаты и сортируем
        const uniqueGroups = [...new Set(data.map(item => item.group_name))].sort()
        return uniqueGroups || []
    } catch (error) {
        console.error('Ошибка при загрузке групп:', error.message)
        return []
    }
}

// ===== SUBJECTS (ПРЕДМЕТЫ) =====
export async function fetchTeacherSubjects(teacherId) {
    try {
        console.log('Ищу предметы для teacher_id:', teacherId)
        const { data, error } = await supabase
            .from('teacher_subjects')
            .select('id, subject')
            .eq('teacher_id', teacherId)
            .order('subject', { ascending: true })

        if (error) throw error
        console.log('Найдено предметов:', data?.length || 0)
        return data || []
    } catch (error) {
        console.error('Ошибка при загрузке предметов:', error.message)
        return []
    }
}

export async function createTeacherSubject(teacherId, teacherName, subject) {
    try {
        const { data, error } = await supabase
            .from('teacher_subjects')
            .insert([{
                teacher_id: teacherId,
                teacher_name: teacherName,
                subject: subject,
                created_at: new Date().toISOString(),
            }])
            .select()

        if (error) throw error
        return { success: true, data: data[0] }
    } catch (error) {
        console.error('Ошибка при добавлении предмета:', error.message)
        return { success: false, error: error.message }
    }
}

// ===== STUDENTS =====
export async function fetchStudentsByGroup(groupName) {
    try {
        const { data, error } = await supabase
            .from('registration_codes')
            .select('used_by, full_name, code, group_name')
            .eq('group_name', groupName)

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Ошибка при загрузке студентов:', error.message)
        return []
    }
}

export async function calculateAverageGrade(grades) {
    if (!grades || grades.length === 0) return 0
    const sum = grades.reduce((acc, grade) => acc + grade.grade_value, 0)
    return (sum / grades.length).toFixed(1)
}

export function getGradeColor(grade) {
    if (grade >= 80) return 'bg-green-500'
    if (grade >= 60) return 'bg-blue-500'
    return 'bg-red-500'
}
