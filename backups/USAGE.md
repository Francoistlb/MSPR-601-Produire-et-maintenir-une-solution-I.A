# Guide d'Utilisation - Sauvegardes PostgreSQL

## Commandes Principales

### Effectuer une sauvegarde
```powershell
.\backups\scripts\postgres_backup.ps1
```

### Tester la restauration
```powershell
.\backups\scripts\test_restore.ps1
```

### Lister les sauvegardes
```powershell
Get-ChildItem ".\backups\daily\backup_*.sql" | Sort-Object CreationTime -Descending | Format-Table Name, @{Name="Taille(KB)";Expression={[math]::Round($_.Length/1KB,2)}}, CreationTime
```

### Nettoyer les anciennes sauvegardes (garder les 7 dernières)
```powershell
$backups = Get-ChildItem ".\backups\daily\backup_*.sql" | Sort-Object CreationTime -Descending
if ($backups.Count -gt 7) {
    $backups | Select-Object -Skip 7 | Remove-Item
    Write-Host "Anciennes sauvegardes supprimées"
}
```

### Sauvegarde complète avec test
```powershell
.\backups\scripts\postgres_backup.ps1
if ($LASTEXITCODE -eq 0) { .\backups\scripts\test_restore.ps1 }
```


### Tâche planifiée Windows (quotidienne à 2h)
```powershell
schtasks /create /tn "MSPR Backup" /tr "powershell.exe -File C:\path\to\postgres_backup.ps1" /sc daily /st 02:00
```

## ✅ Statut Système
- ✅ **Sauvegarde** : Complètement fonctionnelle
- ✅ **Restauration** : Testée et validée  
- ✅ **54+ MB de données** sauvegardées
- ✅ **5 tables** : d_location, f_covid, f_mpox, f_predi_covid, users
- ✅ **463,356 enregistrements** total