# Obsidian Canvas Image Links

Adds the ability to set a link on images in Obsidian Canvas. You can then double click on the image to open the link.

## Features

- Right click on a image shows 2 new menu options: `Set link` and `Open link`
- New command `Set link of selected canvas node`. Configure your own shortcut in Obsidian settings.
- Supports multiple types of links:
    - Web: `https://example.com`
    - Files: `file://C:/Users/abc/Desktop/phenomenal.mkv`
    - Obsidian: `obsidian://open?vault=myvault&file=Testing.canvas`

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Future Improvements

- Show the link next to the node name (if the label is visible via Obsidian Canvas core setting)
