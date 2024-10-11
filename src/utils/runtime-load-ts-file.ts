import { register } from 'esbuild-register/dist/node';

const runtimeLoadTsFile = async <T>(filePath: string) => {
  const { unregister } = register({
    format: 'cjs',
    loader: 'ts',
    drop: ['console'],
  });

  const required = await import(filePath);
  const content = required.default ?? required;

  unregister();

  return content as T;
};

export { runtimeLoadTsFile };
