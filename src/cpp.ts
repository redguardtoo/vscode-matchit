import * as sdk from './sdk';

const cppMacroList = [/^[ \t]*#[ \t]*if/, /^[ \t]*#[ \t]*(elif|else)/, /^[ \t]*#[ \t]*endif/];

export function cppMacroAtPoint() {
  const m = sdk.lineMatchTagList(sdk.getCurrentLineText(), cppMacroList);
  return m === -1 ? null : m;
}

export function cppMacroJump(tagAtPoint: any) {
  sdk.findMatchedTagAndJump(tagAtPoint, cppMacroList);
}
