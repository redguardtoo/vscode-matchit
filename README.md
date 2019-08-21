# [matchit](https://github.com/redguardtoo/vscode-matchit)
Jump between matching HTML tags and brackets smartly in VS Code. It's ported from [Vim matchit](http://www.vim.org/scripts/script.php?script_id=39) by Benji Fisher.

The extension provides the command `MatchIt: Jump Items` to jump between HTML tags or brackets to help Javascript developer using JSX and React.

It's generic enough to support HTML/CSS/C/C++/Java/Perl/Javascript.

![Demo](https://raw.githubusercontent.com/redguardtoo/vscode-matchit/master/demo.gif)

## Features
Press `Ctrl+Shift+\` (on Mac it's `CMD+Shift+\`) or run command `MatchIt: Jump Items` to jump between HTML tags or brackets

Run command `MatchIt: Select Items` to select area marked by matching tags or brackets.

In below code, if cursor is at the beginning or end of class, function, conditional statement, html tag, you can use all commands from this extension.

Please note the cursor is not required exactly over the bracket character. The matching algorithm is smart enough to find correct matching item automatically.
```jsx
export default class DropdownWithFilter extends PureComponent {
  render() {
    const {
      id,
      className,
      style,
      ...props
    } = this.props;
    if(!id) {
      return null;
    }
    return (
      <select
        id={id}
        className={className}
        style={style}
      >
        <option value="1">1</option>
        <option value="1">1</option>
      </select>
    );
  }
}
```

## Custom Keybinding
You can also set custom shortcuts in `keybindings.json` via `Code => Preferences => Keyboard Shortcuts`.

```javascript
[
  {
    "key": "ctrl+shift+\\",
    "command": "extension.matchitJumpItems",
    "when": "editorTextFocus"
  },
  {
    "key": "ctrl+shift+|",
    "command": "extension.matchitSelectItems",
    "when": "editorTextFocus"
  },
]
```

## Issues
Please submit issues to [vscode-matchit support](https://github.com/redguardtoo/vscode-matchit)

## License 

This extension is released under [the GPL v3.0 license](https://raw.githubusercontent.com/redguardtoo/vscode-matchit/master/LICENSE).