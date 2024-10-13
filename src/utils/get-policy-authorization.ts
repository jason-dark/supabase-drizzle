import { TableAccess } from '../types';

type GetPolicyAuthorizationProps = {
  access: TableAccess;
};

const getPolicyAuthorization = ({ access }: GetPolicyAuthorizationProps) => {
  switch (access) {
    case 'DENY_ALL':
      return `AS RESTRICTIVE`;
    default:
      return 'AS PERMISSIVE';
  }
};

export { getPolicyAuthorization };
