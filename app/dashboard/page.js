export const dynamic = 'force-dynamic'

import DashboardClient from './DashboardClient'

export default function Page() {
    return <DashboardClient />
}
                <div className="bg-purple-600 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-800">Портал Студента</h1>
            </div >

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
        </nav >

    {/* Основной контент */ }
    < main className = "p-6 max-w-7xl mx-auto space-y-8" >

        {/* Приветствие */ }
        < div className = "bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-purple-200" >
                <h2 className="text-3xl font-bold mb-2">Рады видеть тебя, {user.name.split(' ')[0]}! 👋</h2>
                <p className="opacity-80">Твой учебный план на сегодня готов. Проверь расписание и задания.</p>
            </div >

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
        </main >

    {/* МОДАЛЬНОЕ ОКНО: Подробнее о ДЗ */ }
{
    selectedHW && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto border border-purple-50">
                <div className="flex justify-between items-center p-8 border-b border-purple-50 sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-slate-800">📚 {selectedHW.subject}</h2>
                    <button
                        export const dynamic='force-dynamic'

                        import DashboardClient from './DashboardClient'

                    export default function Page() {
                          return <DashboardClient />
                        }