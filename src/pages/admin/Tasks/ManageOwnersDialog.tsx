import { ConfirmModal } from '@components/ConfirmModal.tsx';
import Pagination from '@shared/components/Pagination';
import type { TaskDto } from '@shared/models/task';
import type { UserDto, UserRole } from '@shared/models/user';
import { taskService } from '@shared/services/taskService';
import { userService } from '@shared/services/userService';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

interface ManageOwnersDialogProps {
  readonly task: TaskDto;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onTaskUpdated: (task: TaskDto) => void;
}

export default function ManageOwnersDialog({
  task,
  open,
  onClose,
  onTaskUpdated,
}: ManageOwnersDialogProps) {
  const { t } = useTranslation(['admin', 'common']);

  const [owners, setOwners] = useState<UserDto[]>([]);
  const [ownersPage, setOwnersPage] = useState(0);
  const [ownersTotalPages, setOwnersTotalPages] = useState(0);

  const [selectedOwnerId, setSelectedOwnerId] = useState<number | null>(null);

  const [userSearch, setUserSearch] = useState('');
  const [users, setusers] = useState<UserDto[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [usersPage, setUsersPage] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(0);

  const [loadingOwners, setLoadingOwners] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const [openAddOwnerModal, setOpenAddOwnerModal] = useState(false);
  const [openRemoveOwnerModal, setOpenRemoveOwnerModal] = useState(false);

  const [error, setError] = useState(false);

  const roleLabels: Record<UserRole, string> = {
    USER: t('users.roles.user'),
    AUTHOR: t('users.roles.author'),
    JURY: t('users.roles.jury'),
    ORG: t('users.roles.organizer'),
    ADMIN: t('users.roles.admin'),
  };

  const getValidOwnerId = (current: number | null, users: UserDto[]): number | null => {
    if (current === null) {
      return null;
    }

    return users.some(user => user.id === current) ? current : null;
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    if (task.ownerIds.length === 0) {
      setOwners([]);
      setOwnersTotalPages(0);
      setSelectedOwnerId(null);
      return;
    }

    let active = true;

    setLoadingOwners(true);
    setError(false);

    userService
      .getUsersByIds(ownersPage, 5, task.ownerIds)
      .then(data => {
        if (!active) {
          return;
        }

        setOwners(data.content);
        setOwnersTotalPages(data.totalPages);

        setSelectedOwnerId(current => getValidOwnerId(current, data.content));
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setOwners([]);
        setOwnersTotalPages(0);
        setError(true);
      })
      .finally(() => {
        if (active) {
          setLoadingOwners(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open, task.ownerIds, ownersPage]);

  useEffect(() => {
    if (open) {
      setOwnersPage(0);
      setSelectedOwnerId(null);
      setSelectedUser(null);
      setUsersPage(0);
      setUserSearch('');
      setusers([]);
    }
  }, [open, task.id]);

  useEffect(() => {
    setusers([]);
    setUsersTotalPages(0);

    if (!open || !userSearch.trim()) {
      setLoadingUsers(false);
      return;
    }

    let active = true;

    setLoadingUsers(true);
    const timeout = setTimeout(() => {
      userService
        .getUsers(usersPage, 5, userSearch.trim(), ['ORG', 'ADMIN'] as UserRole[])
        .then(data => {
          if (!active) {
            return;
          }

          setusers(data.content);
          setUsersTotalPages(data.totalPages);
        })
        .catch(() => {
          if (!active) {
            return;
          }

          setusers([]);
          setUsersTotalPages(0);
        })
        .finally(() => {
          if (active) {
            setLoadingUsers(false);
          }
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [open, userSearch, usersPage]);

  const handleRemoveOwner = async () => {
    if (selectedOwnerId === null) {
      return;
    }

    const owner = owners.find(user => user.id === selectedOwnerId);

    if (!owner) {
      return;
    }

    setLoadingAction(true);

    try {
      const updatedTask = await taskService.removeOwner(task.id, { ownerEmail: owner.email });

      onTaskUpdated(updatedTask);

      if (owners.length === 1 && ownersPage > 0) {
        setOwnersPage(current => current - 1);
      }

      setSelectedOwnerId(null);
      setOpenRemoveOwnerModal(false);
      toast.success(t('tasks.owners.ownerRemoved'));
    } catch {
      toast.error(t('tasks.owners.ownerRemoveError'));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddOwner = async () => {
    if (!selectedUser) {
      return;
    }

    setLoadingAction(true);

    try {
      const updatedTask = await taskService.addOwner(task.id, {
        newOwnerEmail: selectedUser.email,
      });

      onTaskUpdated(updatedTask);

      setSelectedUser(null);
      setUsersPage(0);
      setUsersTotalPages(0);
      setUserSearch('');
      setusers([]);
      setOpenAddOwnerModal(false);
      toast.success(t('tasks.owners.ownerAdded'));
    } catch {
      toast.error(t('tasks.owners.ownerAddError'));
    } finally {
      setLoadingAction(false);
    }
  };

  if (!open) {
    return null;
  }

  let ownersContent;

  if (loadingOwners) {
    ownersContent = <p className="text-center py-6">{t('tasks.owners.loading')}</p>;
  } else if (error) {
    ownersContent = <p className="text-center py-6">{t('tasks.owners.error')}</p>;
  } else if (owners.length === 0) {
    ownersContent = <p className="text-center py-6 text-meta">{t('tasks.owners.empty')}</p>;
  } else {
    ownersContent = (
      <div className="flex flex-col gap-2">
        {owners.map(owner => {
          const selected = selectedOwnerId === owner.id;

          return (
            <button
              key={owner.id}
              type="button"
              disabled={loadingAction}
              onClick={() => setSelectedOwnerId(owner.id)}
              className={`text-left rounded-xl shadow-md p-4 ${selected ? 'bg-blue-100' : ''}`}
            >
              <div className="font-medium">
                {owner.firstName} {owner.lastName}
              </div>

              <div className="text-sm text-meta">{owner.email}</div>

              <div className="text-xs text-meta mt-1">{roleLabels[owner.role]}</div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">{t('tasks.owners.manage')}</h2>

              <p className="text-sm text-meta mt-1">{task.title}</p>
            </div>

            <button type="button" onClick={onClose} disabled={loadingAction} className="text-xl">
              ×
            </button>
          </div>

          {/* Current owners */}
          <section>
            <h3 className="font-semibold mb-3 text-lg">{t('tasks.owners.current')}</h3>

            {ownersContent}

            {ownersTotalPages > 0 && (
              <div className="mt-4">
                <Pagination
                  page={ownersPage}
                  totalPages={ownersTotalPages}
                  onPageChange={setOwnersPage}
                />
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                type="button"
                disabled={selectedOwnerId === null || loadingAction}
                onClick={() => setOpenRemoveOwnerModal(true)}
                className="btn-regular select-none"
              >
                {t('tasks.owners.remove')}
              </button>
            </div>
          </section>

          <hr className="my-6" />

          {/* Add owner */}
          <section>
            <h3 className="font-semibold mb-3 text-lg">{t('tasks.owners.add')}</h3>

            <input
              type="text"
              value={userSearch}
              onChange={event => {
                setUserSearch(event.target.value);
                setSelectedUser(null);
                setUsersPage(0);
              }}
              placeholder={t('tasks.owners.search')}
              disabled={loadingAction}
              className="w-full border rounded-md px-3 py-2"
            />

            {loadingUsers && <p className="text-sm text-meta mt-2">{t('tasks.owners.loading')}</p>}

            {!loadingUsers && userSearch.trim() && users.length === 0 && (
              <p className="text-sm text-meta mt-2">{t('tasks.owners.noUsers')}</p>
            )}

            {users.length > 0 && (
              <div className="rounded-xl shadow-md mt-2 overflow-hidden">
                {users.map(user => {
                  const selected = selectedUser?.id === user.id;
                  const isOwner = task.ownerIds.includes(user.id);

                  return (
                    <button
                      key={user.id}
                      type="button"
                      disabled={loadingAction || isOwner}
                      onClick={() => {
                        if (!isOwner) {
                          setSelectedUser(user);
                        }
                      }}
                      className={`w-full text-left p-4 border-b last:border-b-0 ${
                        selected ? 'bg-blue-100' : 'hover:bg-gray-50 cursor-pointer'
                      } ${isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>

                      <div className="text-sm text-meta">{user.email}</div>

                      <div className="text-xs text-meta mt-1">{roleLabels[user.role]}</div>

                      {isOwner && (
                        <div className="text-xs text-meta mt-1">
                          {t('tasks.owners.alreadyOwner')}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {usersTotalPages > 0 && (
              <div className="mt-4">
                <Pagination
                  page={usersPage}
                  totalPages={usersTotalPages}
                  onPageChange={setUsersPage}
                />
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                type="button"
                disabled={selectedUser === null || loadingAction}
                onClick={() => setOpenAddOwnerModal(true)}
                className="btn-regular select-none"
              >
                {t('tasks.owners.add')}
              </button>
            </div>
          </section>

          <div className="flex justify-end mt-6">
            <button type="button" onClick={onClose} disabled={loadingAction} className="btn">
              {t('common:general.close')}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal open={openAddOwnerModal} title={t('tasks.owners.add')} message={t('tasks.owners.confirmAddOwner')} onConfirm={handleAddOwner} onClose={() => setOpenAddOwnerModal(false)} />
      <ConfirmModal open={openRemoveOwnerModal} title={t('tasks.owners.remove')} message={t('tasks.owners.confirmRemoveOwner')} onConfirm={handleRemoveOwner} onClose={() => setOpenRemoveOwnerModal(false)} />
    </>
  );
}
