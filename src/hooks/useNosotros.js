'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getNosotrosUsers } from '@/api/nosotros';

export function useNosotros() {
    const [rawUsers, setRawUsers] = useState([]);
    const [storageUrl, setStorageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTermState] = useState('');
    const [selectedDepartment, setSelectedDepartmentState] = useState('all');
    const [sortBy, setSortBy] = useState('name_asc');
    const [viewMode, setViewMode] = useState('grid');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(24);

    const [selectedUser, setSelectedUser] = useState(null);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getNosotrosUsers();

            if (!response?.success) {
                throw new Error(
                    response?.message || 'No se pudo cargar el directorio de colaboradores'
                );
            }

            setRawUsers(response.users || []);
            if (response.storageUrl) {
                setStorageUrl(response.storageUrl);
            }
        } catch (err) {
            console.error('[useNosotros] Error:', err);
            setRawUsers([]);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Manejadores que resetean la página actual a 1 al cambiar un filtro
    const setSearchTerm = useCallback((term) => {
        setSearchTermState(term);
        setPage(1);
    }, []);

    const setSelectedDepartment = useCallback((dept) => {
        setSelectedDepartmentState(dept);
        setPage(1);
    }, []);

    // Extraer lista única de dependencias / departamentos
    const departments = useMemo(() => {
        const set = new Set();
        rawUsers.forEach((u) => {
            if (u?.dep_tag && String(u.dep_tag).trim()) {
                set.add(String(u.dep_tag).trim());
            }
        });
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
    }, [rawUsers]);

    // Filtrado y ordenamiento de usuarios
    const filteredUsers = useMemo(() => {
        return rawUsers
            .filter((user) => {
                // Filtro por departamento
                if (
                    selectedDepartment !== 'all' &&
                    user.dep_tag !== selectedDepartment
                ) {
                    return false;
                }

                // Filtro por término de búsqueda
                if (searchTerm.trim()) {
                    const query = searchTerm.toLowerCase().trim();
                    const fullName = (
                        user.fun_nombre_completo ||
                        `${user.fun_nombre || ''} ${user.fun_nombre2 || ''} ${user.fun_apellido || ''} ${user.fun_apellido2 || ''}`
                    ).toLowerCase();
                    const cargo = (user.car_tag || user.car_nombre || '').toLowerCase();
                    const dep = (user.dep_tag || '').toLowerCase();
                    const correo = (user.fun_correo || '').toLowerCase();
                    const usuario = (user.fun_usuario || '').toLowerCase();
                    const extension = (user.fun_extension || user.fun_telefono || '').toLowerCase();

                    return (
                        fullName.includes(query) ||
                        cargo.includes(query) ||
                        dep.includes(query) ||
                        correo.includes(query) ||
                        usuario.includes(query) ||
                        extension.includes(query)
                    );
                }

                return true;
            })
            .sort((a, b) => {
                const nameA = (
                    a.fun_nombre_completo ||
                    `${a.fun_nombre || ''} ${a.fun_apellido || ''}`
                ).trim().toLowerCase();
                const nameB = (
                    b.fun_nombre_completo ||
                    `${b.fun_nombre || ''} ${b.fun_apellido || ''}`
                ).trim().toLowerCase();
                const deptA = (a.dep_tag || '').toLowerCase();
                const deptB = (b.dep_tag || '').toLowerCase();
                const cargoA = (a.car_tag || '').toLowerCase();
                const cargoB = (b.car_tag || '').toLowerCase();

                switch (sortBy) {
                    case 'name_asc':
                        return nameA.localeCompare(nameB, 'es');
                    case 'name_desc':
                        return nameB.localeCompare(nameA, 'es');
                    case 'dept':
                        return deptA.localeCompare(deptB, 'es') || nameA.localeCompare(nameB, 'es');
                    case 'cargo':
                        return cargoA.localeCompare(cargoB, 'es') || nameA.localeCompare(nameB, 'es');
                    default:
                        return 0;
                }
            });
    }, [rawUsers, selectedDepartment, searchTerm, sortBy]);

    // Paginación
    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(filteredUsers.length / pageSize));
    }, [filteredUsers.length, pageSize]);

    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, page, pageSize]);

    return {
        // Datos
        users: paginatedUsers,
        totalUsers: rawUsers.length,
        filteredCount: filteredUsers.length,
        departments,
        storageUrl,
        loading,
        error,

        // Controles de filtro y vista
        searchTerm,
        setSearchTerm,
        selectedDepartment,
        setSelectedDepartment,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,

        // Paginación
        page,
        setPage,
        pageSize,
        setPageSize,
        totalPages,

        // Modal detalle
        selectedUser,
        setSelectedUser,

        // Acciones
        reload: loadUsers,
    };
}
