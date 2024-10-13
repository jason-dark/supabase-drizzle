import { TableAccess } from '../types';

type GetPolicyRoleProps = {
  access: TableAccess;
};

const getPolicyRole = ({ access }: GetPolicyRoleProps) => {
  switch (access) {
    case 'PUBLIC_ACCESS':
      return `TO public`;
    case 'USER_IS_OWNER':
      return 'TO authenticated';
    case 'USER_HAS_ROLE':
      return 'TO authenticated';
    default:
      return '';
  }
};

export { getPolicyRole };
