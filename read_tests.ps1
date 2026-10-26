Add-Type -AssemblyName System.IO.Compression.FileSystem

$files = [ordered]@{
    'Master' = 'd:\School 26-27\IT_Term_2_Syllabus_Master.docx'
    'P1' = 'd:\School 26-27\01 - Primary 1\term 2\2026-10-07 - Term 2 Master Documents (Plan, Worksheet & Test)\P1_IT_Term_Plan_Term2.docx'
    'P2' = 'd:\School 26-27\02 - Primary 2\Term 2\2026-10-07 - Term 2 Master Documents (Plan, Worksheet & Test)\P2_IT_Term_Plan_Term2.docx'
    'P3' = 'd:\School 26-27\03 - Primary 3\Term 2\2026-10-07 - Term 2 Master Documents (Plan, Worksheet & Test)\P3_IT_Term_Plan_Term2.docx'
}

foreach ($key in $files.Keys) {
    if (Test-Path $files[$key]) {
        $zip = [System.IO.Compression.ZipFile]::OpenRead($files[$key])
        $entry = $zip.GetEntry('word/document.xml')
        $stream = $entry.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $xml = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        $zip.Dispose()
        $text = $xml -replace '<[^>]+>', ' ' -replace '\s+', ' '
        Write-Host "=========================================="
        Write-Host "=== $key ==="
        Write-Host $text.Substring(0, [System.Math]::Min(1500, $text.Length))
    } else {
        Write-Host "File not found: $($files[$key])"
    }
}
