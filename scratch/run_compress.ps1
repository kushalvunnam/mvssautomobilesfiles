
Add-Type -AssemblyName System.Drawing
$dir = "C:\\Users\\kusha\\OneDrive\\Documents\\mvss automobiles\\frontend\\public\\workshop"
Get-ChildItem -Path $dir -Include *.jpeg,*.jpg,*.png -File | ForEach-Object {
    $filePath = $_.FullName
    if ($_.Length -gt 150000) {
        $img = [System.Drawing.Image]::FromFile($filePath)
        $newW = [Math]::Min($img.Width, 720)
        $newH = [int]($img.Height * ($newW / $img.Width))
        $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($img, 0, 0, $newW, $newH)
        $img.Dispose()
        
        $target = $filePath + ".opt"
        $bmp.Save($target, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        $bmp.Dispose()
        
        Remove-Item $filePath -Force
        Move-Item $target $filePath -Force
        Write-Host "Compressed: "$_.Name
    }
}
