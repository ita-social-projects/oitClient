import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ModalClose,
} from '@mui/joy';
import { FormControl, MenuItem, Select } from '@mui/material';
import { userService } from '@services/userService';
import type { UserDto, UserRole, UserStatus } from '@shared/models/user';
import { Phone, Shield } from 'lucide-react';
import { CircleCheck, CirclePause, CircleX, Clock3, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

type UserCardProps = Readonly<{
  user: UserDto;
  onRoleChanged: (id: number, role: UserRole) => void;
}>;

export default function UserCard({ user, onRoleChanged }: UserCardProps) {
  const { t } = useTranslation(['admin', 'common']);
  const roles: UserRole[] = ['USER', 'AUTHOR', 'JURY', 'ORG', 'ADMIN'];
  const roleLabels: Record<UserRole, string> = {
    USER: t('users.roles.user'),
    AUTHOR: t('users.roles.author'),
    JURY: t('users.roles.jury'),
    ORG: t('users.roles.organizer'),
    ADMIN: t('users.roles.admin'),
  };
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [open, setOpen] = useState(false);

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

  const handleConfirm = async () => {
    try {
      await userService.changeRole(user.id, { role: selectedRole });

      onRoleChanged(user.id, selectedRole);

      toast.success(t('users.roleChanged'));

      setOpen(false);
    } catch {
      toast.error(t('users.roleChangeFailed'));
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

        <div className="flex items-center gap-3 mt-20">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              sx={{
                borderRadius: 2,
                minWidth: 160,
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
            className="btn-regular select-none"
            onClick={() => setOpen(true)}
            disabled={selectedRole === user.role}
          >
            {t('users.changeRole')}
          </button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <ModalClose />

          <DialogTitle>{t('users.changeRole')}</DialogTitle>

          <DialogContent>{t('users.confirmRoleChange')}</DialogContent>

          <DialogActions>
            <button className="btn-regular" onClick={handleConfirm}>
              {t('common:general.confirmYes')}
            </button>

            <button className="btn" onClick={() => setOpen(false)}>
              {t('common:general.confirmNo')}
            </button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
}
