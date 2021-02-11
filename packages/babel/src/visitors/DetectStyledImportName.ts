/* eslint-disable no-param-reassign */
/**
 * This Visitor checks if import of `@linaria/react` was renamed and stores that information in state
 */

import type { ImportDeclaration } from '@babel/types';
import type { NodePath } from '@babel/traverse';
import type { State, StrictOptions } from '../types';
import { Core } from '../babel';

const styledLibs = ['@linaria/react', 'linaria/react'];

export default function DetectStyledImportName(
  { types: t }: Core,
  path: NodePath<ImportDeclaration>,
  state: State,
  options: StrictOptions
) {
  const sources = options.importMap?.styled || styledLibs;

  if (
    !(
      t.isLiteral(path.node.source) &&
      sources.indexOf(path.node.source.value) !== -1
    )
  ) {
    return;
  }

  path.node.specifiers.forEach((specifier) => {
    if (
      !t.isImportSpecifier(specifier) ||
      specifier.imported.name !== 'styled'
    ) {
      return;
    }
    if (specifier.local.name !== specifier.imported.name) {
      state.file.metadata.localName = specifier.local.name;
    }
  });
}
