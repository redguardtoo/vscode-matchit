import * as vscode from 'vscode';
import * as sdk from './sdk';
 // maybe it's not efficient to import the lib statically
 // but vscode package system makes me crazy
 // besizes, vscode users might not be as picky as emacs users
import * as cpp from './cpp';

function bracketAtPoint() {
  const ch = sdk.getCharAtPoint();
  return ch && '{}[]()'.indexOf(ch) >= 0 ? ch : null;
}

function bracketAtLineEnd() {
  const currentLine = sdk.getCurrentLineText();
  const m = currentLine.match(/^[ \t]*[A-Za-z].*[ \t]*([\{\(\[])[ \t]*$/);
  return m && m[1];
}

function bracketJump(tagAtPoint: any) {
  vscode.commands.executeCommand('editor.action.jumpToBracket');
}

function htmlTagAtPoint() {
  const currentLine = sdk.getCurrentLineText();
  const m = currentLine.match(/^[ \t]*(<\/?[A-Za-z][a-zA-Z0-9]*)/);
  // strip "</" and "<"
  return m && m[1].replace(/^<\/?/, '');
}

function htmlTagJump() {
  vscode.commands.executeCommand('editor.emmet.action.matchTag');
}

function jumpItemsInternal() {
  const editor = sdk.getEditor();
  if(!editor) {
    return;
  }

  let tagAtPoint = null;

  tagAtPoint = bracketAtPoint();
  if(tagAtPoint !== null) {
    bracketJump(tagAtPoint);
    return;
  }

  tagAtPoint = htmlTagAtPoint();
  if(tagAtPoint !== null) {
    htmlTagJump();
    return;
  }

  tagAtPoint = bracketAtLineEnd();
  if(tagAtPoint !== null) {
    // adjust cursor position
    const lineEndPos = new vscode.Position(sdk.getCurrentLineNumber(), sdk.getCurrentLineText().length - 1);
    sdk.gotoChar(lineEndPos);
    bracketJump(tagAtPoint);
    return;
  }

  if(sdk.languageMatched(['c', 'cpp'])) {
    tagAtPoint = cpp.cppMacroAtPoint();
    if(tagAtPoint !== null) {
      cpp.cppMacroJump(tagAtPoint);
      return;
    }
  }

  bracketJump(tagAtPoint);
}


function selectItemsInternal(fn:any) {
  // Only useful when coding in a text editor
  const editor = sdk.getEditor();
  if (!editor) {
    return;
  }

  const isVisualLine = editor.selection.anchor.character === 0;
  vscode.commands.executeCommand('cancelSelection');

  setTimeout(() => {
    const startPosition = sdk.getCursorPosition();
    if(!startPosition) {
      return;
    }
    jumpItemsInternal();

    // wait cursor position stablized
    setTimeout(() => {
      const endPosition = editor.selection.active;
      // same line
      if(startPosition.line === endPosition.line) {
        editor.selection = new vscode.Selection(startPosition, endPosition);
        if(fn) {
          fn(editor);
        }
      } else {
        // try to select whole line
        const topDown = startPosition.line < endPosition.line;
        const anchor = new vscode.Position(
          startPosition.line,
          isVisualLine
            ? 0
            : editor.document.lineAt(startPosition.line).text.length - 1
        );
        const active = new vscode.Position(
          endPosition.line,
          editor.document.lineAt(endPosition.line).text.length +
            (isVisualLine ? 2 : -1)
        );
        editor.selection = new vscode.Selection(anchor, active);
        if(fn) {
          fn(editor);
        }
      }
    }, 150);
  }, 150);
}

function jumpItems() {
  jumpItemsInternal();
}

function selectItems() {
  selectItemsInternal(null);
}

function deleteItems() {
  selectItemsInternal((editor:vscode.TextEditor) => {
    editor.edit(builder => {
      builder.replace(editor.selection, '');
    });
  });
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "matchit" is now active!');

  const commands: {id: string, callback: any} [] = [
    {id: 'extension.matchitJumpItems', callback: jumpItems,},
    {id: 'extension.matchitSelectItems', callback: selectItems,},
    {id: 'extension.matchitDeleteItems', callback: deleteItems,},
  ];
  for(const c of commands) {
    context.subscriptions.push(vscode.commands.registerCommand(c.id, c.callback));
  }
}

export function deactivate() {}

// Local Variables:
// coding: utf-8
// tab-width: 2
// js-indent-level: 2
// typescript-indent-level: 2
// End:
// vim: set fs=javascript fenc=utf-8 et ts=2 sts=2 sw=2
