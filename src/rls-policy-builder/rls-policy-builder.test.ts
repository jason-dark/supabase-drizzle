import { ifUserIsOwner, rlsPolicyBuilder } from './rls-policy-builder';

describe('rlsPolicyBuilder', () => {
  it('should pass the placeholder test', () => {
    expect(rlsPolicyBuilder('todos', { all: ifUserIsOwner() })).toBeTruthy();
  });
});
