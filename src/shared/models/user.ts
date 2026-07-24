export type Role = 'USER' | 'ADMIN' | 'AUTHOR' | 'JURY' | 'ORG';

export type ResponseUser = {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    middleName: string;
    phoneNumber: string;
    role: Role;
    status: string;
};
