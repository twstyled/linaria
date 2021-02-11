import { dirname } from 'path';
import Module from '../module';
import type { StrictOptions } from '../types';

const cssLibs = ['@linaria/core', 'linaria'];
const styledLibs = ['@linaria/react', 'linaria/react'];

// Verify if the binding is imported from the specified source
export default function hasImport(
  t: any,
  scope: any,
  filename: string,
  identifier: string,
  options: StrictOptions
): boolean {
  const sources =
    identifier === 'css'
      ? options.importMap?.css || cssLibs
      : options.importMap?.styled || styledLibs;

  const linariaLibs = new Set([
    ...(options.importMap?.css || cssLibs),
    ...(options.importMap?.styled || styledLibs),
  ]);

  const binding = scope.getAllBindings()[identifier];

  if (!binding) {
    return false;
  }

  const p = binding.path;

  const resolveFromFile = (id: string) => {
    try {
      return Module._resolveFilename(id, {
        id: filename,
        filename,
        paths: Module._nodeModulePaths(dirname(filename)),
      });
    } catch (e) {
      return null;
    }
  };

  const isImportingModule = (value: string) =>
    sources.some(
      (source) =>
        // If the value is an exact match, assume it imports the module
        value === source ||
        // Otherwise try to resolve both and check if they are the same file
        resolveFromFile(value) ===
          (linariaLibs.has(source)
            ? require.resolve(source)
            : resolveFromFile(source))
    );

  if (t.isImportSpecifier(p) && t.isImportDeclaration(p.parentPath)) {
    return isImportingModule(p.parentPath.node.source.value);
  }

  if (t.isVariableDeclarator(p)) {
    if (
      t.isCallExpression(p.node.init) &&
      t.isIdentifier(p.node.init.callee) &&
      p.node.init.callee.name === 'require' &&
      p.node.init.arguments.length === 1
    ) {
      const node = p.node.init.arguments[0];

      if (t.isStringLiteral(node)) {
        return isImportingModule(node.value);
      }

      if (t.isTemplateLiteral(node) && node.quasis.length === 1) {
        return isImportingModule(node.quasis[0].value.cooked);
      }
    }
  }

  return false;
}
