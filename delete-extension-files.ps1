# Run this from the project root after copying the modified files.
Remove-Item -Recurse -Force "app/api/extension" -ErrorAction SilentlyContinue
Remove-Item -Force "lib/extensionAuth.ts" -ErrorAction SilentlyContinue
Write-Host "Extension files removed."
