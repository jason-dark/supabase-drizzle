import { SqlMethod, TableAccess } from '../types';

type GetPolicyNameProps = {
  access: TableAccess;
  method: SqlMethod;
};

const getPolicyName = ({ access, method }: GetPolicyNameProps) => {
  const upperMethod = method.toUpperCase();

  switch (access) {
    case 'DENY_ALL':
      return `"Deny ${upperMethod} access to everyone"`;
    case 'PUBLIC_ACCESS':
      return `"Allow ${upperMethod} access to everyone"`;
    case 'USER_IS_OWNER':
      return `"Allow ${upperMethod} access based on user_id"`;
    case 'USER_HAS_ROLE':
      return `"Allow ${upperMethod} access based on user_id having role and belonging to same org"`;
    default:
      return '';
  }
};

export { getPolicyName };
