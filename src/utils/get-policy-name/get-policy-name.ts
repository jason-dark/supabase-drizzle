import { SqlMethod, TableAccess } from '../../types';

type GetPolicyNameProps = {
  access: TableAccess;
  method: SqlMethod;
};

const getPolicyName = ({ access, method }: GetPolicyNameProps) => {
  const lowerMethod = method.toLowerCase();

  switch (access) {
    case 'PUBLIC_ACCESS':
      return `"allow_${lowerMethod}_access_to_everyone"`;
    case 'AUTHENTICATED':
      return `"allow_${lowerMethod}_access_to_authenticated_users"`;
    case 'USER_IS_OWNER':
      return `"allow_${lowerMethod}_access_based_on_user_id"`;
    case 'HAS_ROLE':
      return `"allow_${lowerMethod}_access_based_on_user_role"`;
    default:
      return '';
  }
};

export { getPolicyName };
