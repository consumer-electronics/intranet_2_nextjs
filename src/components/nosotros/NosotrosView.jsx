'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

import RefreshIcon from '@mui/icons-material/Refresh';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

import { useNosotros } from '@/hooks/useNosotros';
import NosotrosHeader from './NosotrosHeader';
import UserCard from './UserCard';
import UserDetailModal from './UserDetailModal';

const SKELETON_COUNT = 8;

export default function NosotrosView() {
    const {
        users,
        totalUsers,
        filteredCount,
        departments,
        storageUrl,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        selectedDepartment,
        setSelectedDepartment,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        page,
        setPage,
        totalPages,
        selectedUser,
        setSelectedUser,
        reload,
    } = useNosotros();

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedDepartment('all');
        setPage(1);
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setPage(1);
    };

    const handleDepartmentChange = (value) => {
        setSelectedDepartment(value);
        setPage(1);
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        setPage(1);
    };

    const handleViewModeChange = (value) => {
        setViewMode(value);
        setPage(1);
    };

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: '100%',
                pb: { xs: 4, sm: 5, md: 6 },
            }}
        >
            <NosotrosHeader
                totalUsers={totalUsers}
                filteredCount={filteredCount}
                departments={departments}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                selectedDepartment={selectedDepartment}
                onDepartmentChange={handleDepartmentChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
            />

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: { xs: 2, sm: 3 },
                        borderRadius: 2,
                    }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={reload}
                            startIcon={<RefreshIcon />}
                        >
                            Reintentar
                        </Button>
                    }
                >
                    {error.message ||
                        'Ocurrió un error al cargar la lista de colaboradores.'}
                </Alert>
            )}

            {loading && <LoadingGrid />}

            {!loading && !error && users.length === 0 && (
                <EmptyState onClear={handleClearFilters} />
            )}

            {!loading && !error && users.length > 0 && (
                <>
                    {viewMode === 'grid' ? (
                        <Grid
                            container
                            spacing={{ xs: 2, sm: 2.5, md: 3 }}
                            alignItems="stretch"
                        >
                            {users.map((user, index) => (
                                <Grid
                                    key={
                                        user.fun_id ||
                                        user.fun_usuario ||
                                        `user-${index}`
                                    }
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                        md: 4,
                                        lg: 3,
                                    }}
                                    sx={{
                                        display: 'flex',
                                        minWidth: 0,
                                    }}
                                >
                                    <UserCard
                                        user={user}
                                        storageUrl={storageUrl}
                                        viewMode="grid"
                                        onSelectUser={setSelectedUser}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Stack spacing={{ xs: 1.5, sm: 2 }}>
                            {users.map((user, index) => (
                                <UserCard
                                    key={
                                        user.fun_id ||
                                        user.fun_usuario ||
                                        `user-${index}`
                                    }
                                    user={user}
                                    storageUrl={storageUrl}
                                    viewMode="list"
                                    onSelectUser={setSelectedUser}
                                />
                            ))}
                        </Stack>
                    )}

                    {totalPages > 1 && (
                        <Stack
                            alignItems="center"
                            sx={{
                                mt: { xs: 3, sm: 4, md: 5 },
                                px: 1,
                            }}
                        >
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, nextPage) => setPage(nextPage)}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                                siblingCount={1}
                                boundaryCount={1}
                            />
                        </Stack>
                    )}
                </>
            )}

            <UserDetailModal
                user={selectedUser}
                storageUrl={storageUrl}
                open={Boolean(selectedUser)}
                onClose={() => setSelectedUser(null)}
            />
        </Box>
    );
}

function LoadingGrid() {
    return (
        <Grid
            container
            spacing={{ xs: 2, sm: 2.5, md: 3 }}
            alignItems="stretch"
        >
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <Grid
                    key={`skeleton-${index}`}
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 4,
                        lg: 3,
                    }}
                    sx={{ display: 'flex' }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            width: '100%',
                            minHeight: { xs: 330, sm: 350 },
                            p: { xs: 2, sm: 2.5 },
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Stack
                            alignItems="center"
                            spacing={1.5}
                            sx={{ height: '100%' }}
                        >
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={48}
                                sx={{ borderRadius: 2 }}
                            />

                            <Skeleton
                                variant="circular"
                                width={76}
                                height={76}
                                sx={{ mt: -3 }}
                            />

                            <Skeleton
                                variant="text"
                                width="75%"
                                height={26}
                            />

                            <Skeleton
                                variant="rounded"
                                width="45%"
                                height={24}
                            />

                            <Box sx={{ width: '100%', mt: 1 }}>
                                <Skeleton
                                    variant="text"
                                    width="90%"
                                    height={20}
                                />
                                <Skeleton
                                    variant="text"
                                    width="70%"
                                    height={20}
                                />
                            </Box>

                            <Skeleton
                                variant="rounded"
                                width="100%"
                                height={36}
                                sx={{ mt: 'auto' }}
                            />
                        </Stack>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}

function EmptyState({ onClear }) {
    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                p: {
                    xs: 4,
                    sm: 5,
                    md: 6,
                },
                textAlign: 'center',
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}
        >
            <PersonSearchIcon
                sx={{
                    fontSize: { xs: 48, sm: 56 },
                    color: 'text.secondary',
                    mb: 1.5,
                }}
            />

            <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
            >
                No se encontraron colaboradores
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    maxWidth: 480,
                    mx: 'auto',
                    mb: 3,
                }}
            >
                No hay miembros del equipo que coincidan con los filtros
                aplicados. Intenta modificar el término de búsqueda o
                departamento.
            </Typography>

            <Button
                variant="outlined"
                onClick={onClear}
                sx={{ minWidth: 160 }}
            >
                Limpiar filtros
            </Button>
        </Paper>
    );
}