# Loads backend/.env into the environment and starts the Spring Boot app.
# Usage:  .\start.ps1        (normal)   .\start.ps1 clean package (extra args)
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | Where-Object { $_ -and -not $_.Trim().StartsWith('#') } | ForEach-Object {
        if ($_ -match '^\s*([^=]+)=(.*)$') {
            $name  = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($value.StartsWith('"') -and $value.EndsWith('"')) { $value = $value.Substring(1, $value.Length - 2) }
            if ($value.StartsWith("'") -and $value.EndsWith("'")) { $value = $value.Substring(1, $value.Length - 2) }
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }
}
& (Join-Path $PSScriptRoot "mvnw.cmd") "spring-boot:run" $args
