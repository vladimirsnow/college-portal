import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuthCheck(requiredRole) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const role = localStorage.getItem('user_role')
        const name = localStorage.getItem('user_name')

        if (!role || !name || (requiredRole && role !== requiredRole)) {
            router.push('/')
        } else {
            setIsAuthenticated(true)
            setLoading(false)
        }
    }, [router, requiredRole])

    return { isAuthenticated, loading }
}

export function useUserData() {
    const [user, setUser] = useState({
        role: null,
        name: null,
        group: null,
        id: null,
    })

    useEffect(() => {
        setUser({
            role: localStorage.getItem('user_role'),
            name: localStorage.getItem('user_name'),
            group: localStorage.getItem('group_name'),
            id: localStorage.getItem('student_id'),
        })
    }, [])

    return user
}

export function logout(router) {
    localStorage.clear()
    router.push('/')
}
