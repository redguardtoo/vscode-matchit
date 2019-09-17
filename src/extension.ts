import * as vscode from 'vscode';
import { moveCursor, cursorTo } from 'readline';
import { start } from 'repl';

function jumpToMatchingTag(editor:vscode.TextEditor, position:vscode.Position) {
  const currentLineNum = position.line;
  const line = editor.document.lineAt(currentLineNum).text; // get current line text

  // character under cursor
  const followingChar = editor.document.getText(new vscode.Range(position, new vscode.Position(currentLineNum, position.character + 1)));

  if('{}[]()'.indexOf(followingChar) >= 0) {
    vscode.commands.executeCommand('editor.action.jumpToBracket');
  } else if(line.match(/^[ \t]*(<[A-Za-z]|<\/[A-Za-z][a-zA-Z0-9]*)/)) {
    vscode.commands.executeCommand('editor.emmet.action.matchTag');
  } else if(line.match(/^[ \t]*[A-Za-z].*[ \t]*[\{\(\[]$/)) {
    const lineEndPos = new vscode.Position(currentLineNum, line.length - 1);
    if(editor.selection.isEmpty) {
      editor.selection = new vscode.Selection(lineEndPos, lineEndPos);
    } else {
      editor.selection = new vscode.Selection(editor.selection.anchor, lineEndPos);
    }
    vscode.commands.executeCommand('editor.action.jumpToBracket');
  } else {
    vscode.commands.executeCommand('editor.action.jumpToBracket');
  }
}

function jumpItems() {
  // Only useful when coding in a text editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const startPosition =  editor.selection.active;
  jumpToMatchingTag(editor, startPosition);
}

function selectItemsInternal(fn:any) {
  // Only useful when coding in a text editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const startPosition =  editor.selection.active;
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
      const anchor = new vscode.Position(startPosition.line, topDown ? 0 : editor.document.lineAt(startPosition.line).text.length + 2);
      const active = new vscode.Position(endPosition.line, topDown ? editor.document.lineAt(endPosition.line).text.length + 2 : 0);
      editor.selection = new vscode.Selection(anchor, active);
      if(fn) {
        fn(editor);
      }
    }
  }, 200);
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