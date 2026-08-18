import { ConfirmModal } from '@components/ConfirmModal.tsx';
import { FormControl, MenuItem, Select } from '@mui/material';
import { userService } from '@services/userService';
import type { UserDto, UserRole, UserStatus } from '@shared/models/user';
import { CircleCheck, CirclePause, CircleX, Clock3, Trash2, Phone, Shield } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

type UserCardProps = Readonly<{
  user: UserDto;
  onRoleChanged: (id: number, role: UserRole) => void;
  onStatusChanged: (id: number, status: UserStatus) => void;
}>;

export default function UserCard({ user, onRoleChanged, onStatusChanged }: UserCardProps) {
  const { t } = useTranslation(['admin', 'common']);
  const roles: UserRole[] = ['USER', 'AUTHOR', 'JURY', 'ORG', 'ADMIN'];
  const roleLabels: Record<UserRole, string> = {
    USER: t('users.roles.user'),
    AUTHOR: t('users.roles.author'),
    JURY: t('users.roles.jury'),
    ORG: t('users.roles.organizer'),
    ADMIN: t('users.roles.admin'),
  };
  const statuses: UserStatus[] = ['PENDING', 'ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED'];
  const statusLabels: Record<UserStatus, string> = {
    PENDING: t('users.status.pending'),
    ACTIVE: t('users.status.active'),
    INACTIVE: t('users.status.inactive'),
    BLOCKED: t('users.status.blocked'),
    DELETED: t('users.status.deleted'),
  };
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(user.status);
  const [openRoleChangeModal, setOpenRoleChangeModal] = useState(false);
  const [openStatusChangeModal, setOpenStatusChangeModal] = useState(false);

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <CircleCheck size={16} />;

      case 'PENDING':
        return <Clock3 size={16} />;

      case 'INACTIVE':
        return <CirclePause size={16} />;

      case 'BLOCKED':
        return <CircleX size={16} />;

      case 'DELETED':
        return <Trash2 size={16} />;
    }
  };

  const getStatusLabel = (status: UserStatus) => t(`users.status.${status.toLowerCase()}`);

  const handleConfirmRoleChange = async () => {
    try {
      await userService.changeRole(user.id, { role: selectedRole });

      onRoleChanged(user.id, selectedRole);

      toast.success(t('users.roleChanged'));

      setOpenRoleChangeModal(false);
    } catch {
      toast.error(t('users.roleChangeFailed'));
    }
  };

  const handleConfirmStatusChange = async () => {
    try {
      await userService.changeStatus(user.id, { status: selectedStatus });

      onStatusChanged(user.id, selectedStatus);

      toast.success(t('users.statusChanged'));

      setOpenStatusChangeModal(false);
    } catch {
      toast.error(t('users.statusChangeFailed'));
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center">
        <div className="space-y-1">
          <div className="font-semibold text-lg">
            {user.lastName} {user.firstName} {user.middleName}
          </div>

          <div className="text-sm text-gray-500">{user.email}</div>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <Shield size={15} />
              {roleLabels[user.role]}
            </div>

            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>{user.phoneNumber || t('users.phoneNotSpecified')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            {getStatusIcon(user.status)}
            <span>{getStatusLabel(user.status)}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-3 mt-10">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                aria-label={t('users.changeRole')}
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                sx={{
                  borderRadius: 2,
                  minWidth: 175,
                }}
                className={'select-none'}
                disabled={user.role === 'ADMIN'}
              >
                {roles.map(role => (
                  <MenuItem key={role} value={role}>
                    {roleLabels[role]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <button
              type="submit"
              className="btn-regular select-none"
              style={{
                minWidth: 157,
              }}
              onClick={() => {
                setOpenRoleChangeModal(true);
              }}
              disabled={selectedRole === user.role}
            >
              {t('users.changeRole')}
            </button>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                aria-label={t('users.changeStatus')}
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                sx={{
                  borderRadius: 2,
                  minWidth: 175,
                }}
                className={'select-none'}
                disabled={user.role === 'ADMIN'}
              >
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {statusLabels[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <button
              type="submit"
              className="btn-regular select-none"
              style={{
                minWidth: 157,
              }}
              onClick={() => {
                setOpenStatusChangeModal(true);
              }}
              disabled={selectedStatus === user.status}
            >
              {t('users.changeStatus')}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal open={openRoleChangeModal} title={t('users.changeRole')} message={t('users.confirmRoleChange')} onConfirm={handleConfirmRoleChange} onClose={() => setOpenRoleChangeModal(false)} />
      <ConfirmModal open={openStatusChangeModal} title={t('users.changeStatus')} message={t('users.confirmStatusChange')} onConfirm={handleConfirmStatusChange} onClose={() => setOpenStatusChangeModal(false)} />
    </>
  );
}
