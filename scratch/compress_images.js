const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = path.join(__dirname, '../frontend/public/workshop');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

console.log('Compressing workshop images safely...');

const psScript = `
Add-Type -AssemblyName System.Drawing
$dir = "${dir.replace(/\\/g, '\\\\')}"
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
`;

fs.writeFileSync(path.join(__dirname, 'run_compress.ps1'), psScript);
execSync('powershell -ExecutionPolicy Bypass -File "' + path.join(__dirname, 'run_compress.ps1') + '"', { stdio: 'inherit' });
console.log('All workshop images compressed successfully!');
