import * as vscode from 'vscode';

export function getEditor() {
  return vscode.window.activeTextEditor;
}

export function languageMatched(languages: string[]) {
  const editor = getEditor();
  if(!editor) {
    return null;
  }
  return languages.find(l => l === editor.document.languageId);
}

export function getCurrentLineNumber() {
  const position = getCursorPosition();
  return position && position.line || 0;
}

function getLineText(lineNumber: number) {
  const editor = getEditor();
  if(!editor) {
    return '';
  }
  return editor.document.lineAt(lineNumber).text || '';
}

export function getCurrentLineText() {
  return getLineText(getCurrentLineNumber());
}

export function getCharAtPoint() {
  const position = getCursorPosition();
  const editor = getEditor();
  if(!position || !editor) {
    return '';
  }
  return editor.document.getText(new vscode.Range(position, new vscode.Position(getCurrentLineNumber(), position.character + 1)));
}

export function gotoChar(position: vscode.Position) {
  const editor = getEditor();
  if(!editor || !position) {
    return;
  }
  if (editor.selection.isEmpty) {
    editor.selection = new vscode.Selection(position, position);
  } else {
    editor.selection = new vscode.Selection(editor.selection.anchor, position);
  }
}

export function getCursorPosition() {
  const editor = getEditor();
  if(!editor) {
    return null;
  }
  return editor.selection.active;
}

export function lineMatchTagList(line: string, tagList: any[]) {
  for (let i = 0; i < tagList.length; i++) {
    const m = line.match(tagList[i]);
    if(m) {
      return i;
    }
  }
  return -1;
}

export function findMatchedTagAndJump(tagAtPoint: any, tagList: any[]) {
  let level = 1;
  let found = -1; // match tag line number

  const editor = getEditor();
  if(!editor) {
    return;
  }

  let n = getCurrentLineNumber();

  switch(tagAtPoint) {
    case 0:
      // open tag
    case 1:
      // middle tag
      n++;
      for(let i = n ; i < editor.document.lineCount; i++) {
        const m = lineMatchTagList(getLineText(i), tagList) ;
        if(level === 1 && (m === 1 || m === 2)) {
          found = i;
          break; // stop for loop
        }
        if(m === 0)  {
          level++;
        } else if(m === 2) {
          level--;
        }
      }
      break;

    case 2:
      // end tag
      n--;
      for(let i = n ; i >= 0; i--) {
        const m = lineMatchTagList(getLineText(i), tagList) ;
        if(level === 1 && m === 0) {
          found = i;
          break; // stop for loop
        }
        if(m === 2)  {
          level++;
        } else if(m === 0) {
          level--;
        }
      }
      break;
  }
  if(found !== -1) {
    gotoChar(new vscode.Position(found, editor.document.lineAt(found).firstNonWhitespaceCharacterIndex));
  }
}

// Local Variables:
// coding: utf-8
// tab-width: 2
// js-indent-level: 2
// typescript-indent-level: 2
// End:
// vim: set fs=javascript fenc=utf-8 et ts=2 sts=2 sw=2