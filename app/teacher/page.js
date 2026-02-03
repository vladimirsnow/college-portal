export const dynamic = 'force-dynamic'

import TeacherClient from './TeacherClient'

export default function Page() {
    return <TeacherClient />
}
{/* Выбор группы */ }
<div className="mb-8">
    <label className="block text-sm font-bold text-slate-600 mb-2">Выберите группу:</label>
    {groups.length > 0 ? (
        <select
            value={group}
            onChange={e => setGroup(e.target.value)}
            className="w-full md:w-64 p-3 bg-white border border-purple-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-300"
        >
            {groups.map(g => (
                <option key={g} value={g}>{g}</option>
            ))}
        </select>
    ) : (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-700 text-sm">
            Нет групп в базе данных. Добавьте студентов в группы.
        </div>
    )}
</div>

{/* Вкладка: Домашние задания */ }
{
    activeTab === 'homework' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Форма добавления ДЗ */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-purple-100/50 border border-purple-50 h-fit">
                <div className="flex items-center gap-3 mb-6 text-purple-600">
                    <PlusCircle size={24} />
                    <h2 className="text-xl font-bold">Новое задание</h2>
                </div>

                <label className="block text-sm font-bold text-slate-600 mb-2">Выберите предмет:</label>
                <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full p-4 mb-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-200"
                >
                    <option value="">Выбрать предмет...</option>
                    {subjects.map(s => (
                        <option key={s.id} value={s.subject}>{s.subject}</option>
                    ))}
                </select>

                <textarea
                    placeholder="Описание задания..."
                    className="w-full p-4 mb-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 h-40"
                    value={task}
                    onChange={e => setTask(e.target.value)}
                />

                <label className="block text-sm font-bold text-slate-600 mb-2">Срок выполнения:</label>
                <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full p-4 mb-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-200"
                />

                <button
                    onClick={handleAddHW}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-50"
                >
                    {loading ? 'Публикация...' : 'Опубликовать ДЗ'}
                </button>
            </div>

            {/* Список ДЗ */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-purple-100/50 border border-purple-50">
                <h2 className="text-xl font-bold text-purple-600 mb-6">Актуальные задания</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {homeworks.length > 0 ? (
                        homeworks.map(hw => (
                            <div key={hw.id} className="p-4 bg-slate-50 rounded-2xl border border-purple-100">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="font-bold text-purple-600">{hw.subject}</div>
                                        <div className="text-sm text-slate-600 mt-2">{hw.task_text}</div>
                                        <div className="text-xs text-slate-400 mt-2">Срок: {hw.deadline}</div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteHW(hw.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-slate-400 py-4">Нет заданий</p>
                    )}
                </div>
            </div>
        </div>
    )
}

{/* Вкладка: Оценки */ }
{
    activeTab === 'grades' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Форма выставления оценок */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-purple-100/50 border border-purple-50 h-fit">
                <div className="flex items-center gap-3 mb-6 text-purple-600">
                    <Star size={24} />
                    <h2 className="text-xl font-bold">Выставить оценку</h2>
                </div>

                <label className="block text-sm font-bold text-slate-600 mb-2">Выберите предмет:</label>
                <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full p-4 mb-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-200"
                >
                    <option value="">Выбрать предмет...</option>
                    {subjects.map(s => (
                        <option key={s.id} value={s.subject}>{s.subject}</option>
                    ))}
                </select>

                <label className="block text-sm font-bold text-slate-600 mb-2">Выберите студента:</label>
                <select
                    value={selectedStudent}
                    onChange={e => {
                        const selected = allStudents.find(s => s.used_by === e.target.value)
                        setSelectedStudent(e.target.value)
                        setSelectedStudentName(selected?.full_name || '')
                    }}
                    className="w-full p-4 mb-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-200"
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
                    className="w-full p-4 mb-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-200"
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                />

                <label className="block text-sm font-bold text-slate-600 mb-2">Комментарий (опционально):</label>
                <textarea
                    placeholder="Добавь комментарий к оценке..."
                    className="w-full p-4 mb-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 h-24 resize-none"
                    value={gradeComment}
                    onChange={e => setGradeComment(e.target.value)}
                />

                <button
                    onClick={handleAddGrade}
                    disabled={loading}
                    className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                >
                    {loading ? 'Сохранение...' : 'Выставить оценку'}
                </button>
            </div>

            {/* История оценок */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-purple-100/50 border border-purple-50">
                <h2 className="text-xl font-bold text-purple-600 mb-6">История оценок</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {grades.length > 0 ? (
                        grades.map((g) => (
                            <div key={g.id} className="p-4 bg-slate-50 rounded-2xl border border-purple-100">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-800">{g.subject}</div>
                                        <div className="text-sm text-slate-600">Студент: {g.student_id}</div>
                                        <div className="text-xs text-slate-400">Дата: {new Date(g.created_at).toLocaleDateString('ru-RU')}</div>
                                    </div>
                                    {editingGradeId === g.id ? (
                                        <div className="w-full flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={editingGradeValue}
                                                    onChange={e => setEditingGradeValue(e.target.value)}
                                                    className="flex-1 p-2 bg-white border border-purple-200 rounded-lg text-center"
                                                />
                                            </div>
                                            <textarea
                                                placeholder="Комментарий..."
                                                value={editingGradeComment}
                                                onChange={e => setEditingGradeComment(e.target.value)}
                                                className="w-full p-2 bg-white border border-purple-200 rounded-lg text-sm resize-none h-16"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleUpdateGrade}
                                                    disabled={loading}
                                                    className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-all text-sm font-bold"
                                                >
                                                    ✓ Сохранить
                                                </button>
                                                <button
                                                    onClick={() => setEditingGradeId(null)}
                                                    className="flex-1 bg-gray-400 text-white px-3 py-2 rounded-lg hover:bg-gray-500 transition-all text-sm font-bold"
                                                >
                                                    ✕ Отмена
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="flex gap-2 items-center">
                                                <div className={`text-lg font-bold text-white px-4 py-2 rounded-lg ${getGradeColor(g.grade_value)}`}>{g.grade_value}</div>
                                                <button
                                                    onClick={() => handleEditGrade(g.id, g.grade_value, g.comment || '')}
                                                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={18} />
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
                        <p className="text-center text-slate-400 py-4">Нет оценок</p>
                    )}
                </div>
            </div>
        </div>
    )
}

{/* Вкладка: Студенты группы */ }
{
    activeTab === 'students' && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-purple-100/50 border border-purple-50">
            <h2 className="text-xl font-bold text-purple-600 mb-6">Студенты группы {group}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allStudents.length > 0 ? (
                    allStudents.map(student => (
                        <div key={student.used_by} className="p-4 bg-slate-50 rounded-2xl border border-purple-100">
                            <div className="font-bold text-slate-800">{student.full_name}</div>
                            <div className={`text-xs mt-2 px-3 py-1 rounded-full font-bold inline-block ${student.used_by ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {student.used_by ? '✓ Зарегистрирован' : '○ Не зарегистрирован'}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="col-span-full text-center text-slate-400 py-8">Нет студентов в группе</p>
                )}
            </div>
        </div>
    )
}
        </div >
    </div >
)
}   