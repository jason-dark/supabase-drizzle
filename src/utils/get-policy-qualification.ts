import { SqlMethod, TableAccess } from '../types';

type GetPolicyQualificationProps = {
  method: SqlMethod;
  access: TableAccess;
};

const getPolicyQualification = ({ method, access }: GetPolicyQualificationProps) => {
  const upperMethod = method.toUpperCase();

  let qualification = '';

  if (upperMethod === 'SELECT' || upperMethod === 'UPDATE' || upperMethod === 'DELETE') {
    switch (access) {
      case 'PUBLIC_ACCESS':
        qualification = 'USING (true)';
        break;
      case 'USER_IS_OWNER':
        qualification = 'USING ((select auth.uid()) = user_id)';
        break;
      case 'DENY_ALL':
        qualification = 'USING (false)';
        break;
    }
  }

  if (upperMethod === 'INSERT') {
    switch (access) {
      case 'PUBLIC_ACCESS':
        qualification = 'WITH CHECK (true)';
        break;
      case 'USER_IS_OWNER':
        qualification = 'WITH CHECK ((select auth.uid()) = user_id)';
        break;
      case 'DENY_ALL':
        qualification = 'WITH CHECK (false)';
        break;
    }
  }

  if (upperMethod === 'ALL') {
    switch (access) {
      case 'PUBLIC_ACCESS':
        qualification = 'USING (true) WITH CHECK (true)';
        break;
      case 'USER_IS_OWNER':
        qualification =
          'USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)';
        break;
      case 'DENY_ALL':
        qualification = 'USING (false) WITH CHECK (false)';
        break;
    }
  }

  return qualification;
};

export { getPolicyQualification };
