# Portfolio

Static portfolio site published with GitHub Pages.

## Pages

| Path | Content |
|---|---|
| `/` | Neutral project directory. Focus pages are not listed. |
| `/focus/cpp/` | C/C++ development projects. |
| `/focus/solver/` | C/C++ development fundamentals and selected implementation examples. |
| `/projects/*/` | Shared technical details. |
| `/focus/3d/` | Legacy redirect to the C++ focus. |

Focus pages link to shared project pages with `?focus=cpp` or `?focus=solver`.
The project header and return link lead back to that focus and project anchor.
Missing or unknown focus values return to the root directory. No session state
or arbitrary return URL is used. Without JavaScript, the root links remain usable.

Legacy root anchors for TinyRenderer, miniRT and FdF select directory entries.
The older IRC and minishell anchors still redirect to their C++ focus entries.
