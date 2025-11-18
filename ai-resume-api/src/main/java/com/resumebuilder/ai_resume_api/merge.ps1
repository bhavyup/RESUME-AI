# --- Configuration ---
# $PSScriptRoot is a special variable that means "the folder this script is in"
$ListFile = "$PSScriptRoot/list.txt"
$OutputFile = "$PSScriptRoot/gameplan.txt"

# --- Main Script ---

# 1. Delete the old output file if it exists.
#    -ErrorAction SilentlyContinue just means "don't show an error if the file doesn't exist"
if (Test-Path $OutputFile) {
    Remove-Item $OutputFile -ErrorAction SilentlyContinue
    Write-Host "Removed old output file."
}

# 2. Get the list of file paths from list.txt
#    Get-Content reads the text file, one line at a time
$FilePaths = Get-Content $ListFile

Write-Host "Starting to merge files..."

# 3. Loop through each file path
foreach ($File in $FilePaths) {
    # Skip any empty lines in your list.txt
    if ([string]::IsNullOrWhiteSpace($File)) {
        continue
    }

    Write-Host " + Adding $File ..."

    $fpath = "D:\codes\Project\AI Resume Builder\ai-resume-api\src\main\java\com\resumebuilder\ai_resume_api\$File.java"
    
    # 4. Get the content of the current file
    $Content = Get-Content $fpath -Raw

    # 5. Create the formatted block of text
    $Block = "$File`n``````java`n$Content`n```````n"
    
    # 6. Append the entire block to our output file
    Add-Content -Path $OutputFile -Value $Block
}

Write-Host "All done! Merged content is in $OutputFile"