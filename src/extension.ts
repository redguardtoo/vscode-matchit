import * as vscode from 'vscode';
import { moveCursor, cursorTo } from 'readline';
import { start } from 'repl';

function bracketAtPoint(followingChar:string, currentLine:string) {
  return followingChar && '{}[]()'.indexOf(followingChar) >= 0 ? followingChar : null;
}

function bracketAtLineEnd(followingChar:string, currentLine:string) {
  const m = currentLine.match(/^[ \t]*[A-Za-z].*[ \t]*([\{\(\[])[ \t]*$/);
  return m && m[1];
}

function bracketJump(followingChar:string, currentLine:string, tagAtPoint: any) {
  vscode.commands.executeCommand('editor.action.jumpToBracket');
}

function htmlTagAtPoint(followingChar:string, currentLine:string) {
  const m = currentLine.match(/^[ \t]*(<\/?[A-Za-z][a-zA-Z0-9]*)/);
  // strip "</" and "<"
  return m && m[1].replace(/^<\/?/, '');
}

function htmlTagJump(followingChar:string, currentLine:string, tagAtPoint: any) {
  vscode.commands.executeCommand('editor.emmet.action.matchTag');
}

function getInfoAtPoint(editor:vscode.TextEditor, position:vscode.Position) {
  const currentLineNum = position.line;
  const currentLine = editor.document.lineAt(currentLineNum).text; // get current line text

  // character under cursor
  const followingChar = editor.document.getText(new vscode.Range(position, new vscode.Position(currentLineNum, position.character + 1)));
  return {followingChar, currentLine, currentLineNum,};
}

function jumpToMatchingTag(editor:vscode.TextEditor, position:vscode.Position) {
  const {followingChar, currentLine, currentLineNum,} = getInfoAtPoint(editor, position);
  let tagAtPoint = null;

  if(tagAtPoint = bracketAtPoint(followingChar, currentLine)) {
    bracketJump(followingChar, currentLine, tagAtPoint);
  } else if(tagAtPoint = htmlTagAtPoint(followingChar, currentLine)) {
    htmlTagJump(followingChar, currentLine, tagAtPoint);
  } else if(tagAtPoint = bracketAtLineEnd(followingChar, currentLine)) {
    // adjust cursor position
    const lineEndPos = new vscode.Position(currentLineNum, currentLine.length - 1);
    if(editor.selection.isEmpty) {
      editor.selection = new vscode.Selection(lineEndPos, lineEndPos);
    } else {
      editor.selection = new vscode.Selection(editor.selection.anchor, lineEndPos);
    }
    bracketJump(followingChar, currentLine, tagAtPoint);
  } else {
    bracketJump(followingChar, currentLine, tagAtPoint);
  }
}

function jumpItems() {
  // Only useful when coding in a text editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const startPosition = editor.selection.active;
  jumpToMatchingTag(editor, startPosition);
}

function selectItemsInternal(fn:any) {
  // Only useful when coding in a text editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const isVisualLine = editor.selection.anchor.character === 0;
  vscode.commands.executeCommand('cancelSelection');

  setTimeout(() => {
    const startPosition = editor.selection.active;
    jumpToMatchingTag(editor, startPosition);

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
