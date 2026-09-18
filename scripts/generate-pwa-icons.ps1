$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$iconDirectory = Join-Path $PSScriptRoot '../public/icons'
New-Item -ItemType Directory -Path $iconDirectory -Force | Out-Null

$icons = @(
    @{ Name = 'icon-192.png'; Size = 192 },
    @{ Name = 'icon-512.png'; Size = 512 },
    @{ Name = 'icon-maskable-512.png'; Size = 512 },
    @{ Name = 'apple-touch-icon.png'; Size = 180 }
)

foreach ($icon in $icons) {
    $size = $icon.Size
    $bitmap = [System.Drawing.Bitmap]::new($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $font = [System.Drawing.Font]::new(
        'Georgia',
        [single]($size * 0.52),
        [System.Drawing.FontStyle]::Regular,
        [System.Drawing.GraphicsUnit]::Pixel
    )
    $format = [System.Drawing.StringFormat]::new()

    try {
        $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#A8892F'))
        $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $format.LineAlignment = [System.Drawing.StringAlignment]::Center
        $bounds = [System.Drawing.RectangleF]::new(0, 0, $size, $size)
        $graphics.DrawString('S', $font, [System.Drawing.Brushes]::White, $bounds, $format)
        $bitmap.Save(
            (Join-Path $iconDirectory $icon.Name),
            [System.Drawing.Imaging.ImageFormat]::Png
        )
    }
    finally {
        $format.Dispose()
        $font.Dispose()
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}
