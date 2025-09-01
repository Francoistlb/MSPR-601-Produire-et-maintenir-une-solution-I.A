# Script de conversion Markdown vers PDF
# Convertit tous les documents principaux du projet MSPR

Write-Host "🔄 Conversion des documents Markdown en PDF..." -ForegroundColor Cyan

# Documents principaux à convertir
$documents = @(
    "frontend\TESTS_COVERAGE_REPORT.md",
)

# Créer dossier de sortie
$outputDir = "Documentation\PDF"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
    Write-Host "✅ Dossier créé : $outputDir" -ForegroundColor Green
}

foreach ($doc in $documents) {
    if (Test-Path $doc) {
        $fileName = [System.IO.Path]::GetFileNameWithoutExtension($doc)
        $outputPath = "$outputDir\$fileName.pdf"
        
        Write-Host "📄 Conversion : $doc → $fileName.pdf" -ForegroundColor Yellow
        
        try {
            # Utiliser pandoc si disponible
            if (Get-Command pandoc -ErrorAction SilentlyContinue) {
                pandoc $doc -o $outputPath --pdf-engine=wkhtmltopdf
                Write-Host "✅ Converti avec Pandoc" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Pandoc non installé. Utilisez l'extension VS Code." -ForegroundColor Orange
            }
        } catch {
            Write-Host "❌ Erreur lors de la conversion : $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  Fichier introuvable : $doc" -ForegroundColor Orange
    }
}

Write-Host "`n🎉 Conversion terminée ! PDFs disponibles dans : $outputDir" -ForegroundColor Cyan
Write-Host "💡 Alternative : Utilisez 'Ctrl+Shift+P' → 'Markdown PDF: Export' dans VS Code" -ForegroundColor Blue
