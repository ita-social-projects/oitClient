import { userService } from '@services/userService';
import Pagination from '@shared/components/Pagination/Pagination';
import type { UserDto, UserResponse, UserRole, UserStatus } from '@shared/models/user';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import UserCard from './UserCard';
import UserSearch from './UserSearch';

export default function AdminUsersPage() {
  const { t } = useTranslation('admin');

  const [users, setUsers] = useState<UserDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    userService
      .getUsers(page, 10, search)
      .then((data: UserResponse) => {
        if (!active) return;
        setUsers(data.content);
        setTotalPages(data.totalPages);
        setError(false);
      })
      .catch(() => {
        if (!active) return;
        setUsers([]);
        setTotalPages(0);
        setError(true);
      });

    return () => {
      active = false;
    };
  }, [page, search]);

  const handleRoleChanged = (id: number, role: UserRole) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === id
          ? {
              ...user,
              role,
            }
          : user,
      ),
    );
  };

  const handleStatusChanged = (id: number, status: UserStatus) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === id
          ? {
              ...user,
              status,
            }
          : user,
      ),
    );
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col">
      <h1 className="font-bold mb-2">{t('users.title')}</h1>

      <p className="text-sm text-meta mb-6">{t('users.subtitle')}</p>

      <UserSearch search={search} setSearch={setSearch} setPage={setPage} />

      {users.length === 0 && !error ? (
        <p className="text-center py-10">{t('users.empty')}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {users.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onRoleChanged={handleRoleChanged}
              onStatusChanged={handleStatusChanged}
            />
          ))}
        </div>
      )}

      {error ? <p className="text-center py-10">{t('users.error')}</p> : <></>}

      <div className="mt-8">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
