# Obsidian Canvas Image Links

Adds the ability to set a link on images in Obsidian Canvas. You can then double click on the image to open the link.

## Features

- Right click on a image shows 2 new menu options: Set link and Open link
- Use a keyboard shortcut on the "Set link of selected canvas node" command to quickly set a link on a selected image
- Supports multiple types of links:
    - Web pages:`https://example.com`
    - Obsidian links: `obsidian://open?vault=myvault&file=Testing.canvas`
    - Files: `file://C:/Users/abc/Desktop/phenomenal.mkv`

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Future Improvements

- Show the link next to the node name (if the label is visible via Obsidian Canvas core setting)
