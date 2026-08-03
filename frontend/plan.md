This API POST http://localhost/api/sandbox/start will create an sandbox and return data like this
{
    "message": "Sandbox started successfully!",
    "sandboxId": "019fc58b-2a22-7394-9bbb-a6ec3d851e4d",
    "previewUrl": "http://019fc58b-2a22-7394-9bbb-a6ec3d851e4d.preview.127.0.0.1.nip.io",
    "agentUrl": "http://019fc58b-2a22-7394-9bbb-a6ec3d851e4d.agent.127.0.0.1.nip.io"
}


This url http://019fc58b-2a22-7394-9bbb-a6ec3d851e4d.preview.127.0.0.1.nip.io will preview the application

This API GET http://019fc58b-2a22-7394-9bbb-a6ec3d851e4d.agent.127.0.0.1.nip.io/list-files will list all the files in the sandbox response will be like this
{
  "message": "Files listed directory",
  "files": [
    ".dockerignore",
    ".gitignore",
    "README.md",
    "dockerfile",
    "eslint.config.js",
    "index.html",
    "package-lock.json",
    "package.json",
    "public/favicon.svg",
    "public/icons.svg",
    "src/App.css",
    "src/App.jsx",
    "src/assets/hero.png",
    "src/assets/react.svg",
    "src/assets/vite.svg",
    "src/index.css",
    "src/main.jsx",
    "src/shims/react-scroll.jsx",
    "vite.config.js"
  ]
}


This API GET http://019fc58b-2a22-7394-9bbb-a6ec3d851e4d.agent.127.0.0.1.nip.io/read-files?files=src/App.css will read the files and return the content of the files like this
{
    "message": "File contents",
    "files": [
        {
            "/src/App.css": ".counter {\n  font-size: 16px;\n  padding: 5px 10px;\n  border-radius: 5px;\n  color: var(--accent);\n  background: var(--accent-bg);\n  border: 2px solid transparent;\n  transition: border-color 0.3s;\n  margin-bottom: 24px;\n\n  &:hover {\n    border-color: var(--accent-border);\n  }\n  &:focus-visible {\n    outline: 2px solid var(--accent);\n    outline-offset: 2px;\n  }\n}\n\n.hero {\n  position: relative;\n\n  .base,\n  .framework,\n  .vite {\n    inset-inline: 0;\n    margin: 0 auto;\n  }\n\n  .base {\n    width: 170px;\n    position: relative;\n    z-index: 0;\n  }\n\n  .framework,\n  .vite {\n    position: absolute;\n  }\n\n  .framework {\n    z-index: 1;\n    top: 34px;\n    height: 28px;\n    transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)\n      scale(1.4);\n  }\n\n  .vite {\n    z-index: 0;\n    top: 107px;\n    height: 26px;\n    width: auto;\n    transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg)\n      scale(0.8);\n  }\n}\n\n#center {\n  display: flex;\n  flex-direction: column;\n  gap: 25px;\n  place-content: center;\n  place-items: center;\n  flex-grow: 1;\n\n  @media (max-width: 1024px) {\n    padding: 32px 20px 24px;\n    gap: 18px;\n  }\n}\n\n#next-steps {\n  display: flex;\n  border-top: 1px solid var(--border);\n  text-align: left;\n\n  & > div {\n    flex: 1 1 0;\n    padding: 32px;\n    @media (max-width: 1024px) {\n      padding: 24px 20px;\n    }\n  }\n\n  .icon {\n    margin-bottom: 16px;\n    width: 22px;\n    height: 22px;\n  }\n\n  @media (max-width: 1024px) {\n    flex-direction: column;\n    text-align: center;\n  }\n}\n\n#docs {\n  border-right: 1px solid var(--border);\n\n  @media (max-width: 1024px) {\n    border-right: none;\n    border-bottom: 1px solid var(--border);\n  }\n}\n\n#next-steps ul {\n  list-style: none;\n  padding: 0;\n  display: flex;\n  gap: 8px;\n  margin: 32px 0 0;\n\n  .logo {\n    height: 18px;\n  }\n\n  a {\n    color: var(--text-h);\n    font-size: 16px;\n    border-radius: 6px;\n    background: var(--social-bg);\n    display: flex;\n    padding: 6px 12px;\n    align-items: center;\n    gap: 8px;\n    text-decoration: none;\n    transition: box-shadow 0.3s;\n\n    &:hover {\n      box-shadow: var(--shadow);\n    }\n    .button-icon {\n      height: 18px;\n      width: 18px;\n    }\n  }\n\n  @media (max-width: 1024px) {\n    margin-top: 20px;\n    flex-wrap: wrap;\n    justify-content: center;\n\n    li {\n      flex: 1 1 calc(50% - 8px);\n    }\n\n    a {\n      width: 100%;\n      justify-content: center;\n      box-sizing: border-box;\n    }\n  }\n}\n\n#spacer {\n  height: 88px;\n  border-top: 1px solid var(--border);\n  @media (max-width: 1024px) {\n    height: 48px;\n  }\n}\n\n.ticks {\n  position: relative;\n  width: 100%;\n\n  &::before,\n  &::after {\n    content: '';\n    position: absolute;\n    top: -4.5px;\n    border: 5px solid transparent;\n  }\n\n  &::before {\n    left: 0;\n    border-left-color: var(--border);\n  }\n  &::after {\n    right: 0;\n    border-right-color: var(--border);\n  }\n}\n"
        }
    ]
}


This API PATCH http://019fc58b-2a22-7394-9bbb-a6ec3d851e4d.agent.127.0.0.1.nip.io/update-files will update the files in the sandbox and return the response like this
{
    "message": "File update results",
    "results": [
        {
            "/workspace/src/App.css": "File updated successfully"
        }
    ]
}


This API POST http://localhost/api/ai/invoke will invoke the AI model it take input like this
{
  "message": "Add animations for winning moves , Improve the UI with a darker theme , Add a restart button for quick resets",
  "projectId": "019fc58b-2a22-7394-9bbb-a6ec3d851e4d"
}

Return the response like this in SSE

Connection closed
08:46:15.860
done
[DONE]
08:46:15.811
final
Here’s what I’ve implemented to address your requests: --- ### **Changes Made** 1. **Animations for Winning Moves** - Added a `winning-square` class to squares that are part of the winning combin
08:46:15.787
log
Files updated successfully.
08:46:07.404
log
Updating files...src/App.jsx,src/App.css,src/index.css
08:46:07.371
log
Files read successfully.
08:45:47.695
log
Reading files...src/App.jsx,src/App.css,src/index.css,src/main.jsx,package.json
08:45:47.680
log
Files listed successfully.Files: .dockerignore,.gitignore,README.md,dockerfile,eslint.config.js,index.html,package-lock.json,package.json,public/favicon.svg,public/icons.svg,src/App.css,src/App.jsx,sr
08:45:45.981
log
Listing files in project directory...
08:45:45.963
Connected to http://localhost/api/ai/invoke
08:45:45.061

Socket.io url - 019fc58b-2a22-7394-9bbb-a6ec3d851e4d.agent.127.0.0.1.nip.io //use xterm js for terminal on frontend
with a event name "terminal-input" for terminal input and "terminal-output" for terminal output