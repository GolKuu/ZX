param([switch]$AttacksOnly)
$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path "$PSScriptRoot/../..")
$blenderBinary = 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe'
$license = 'Adobe Mixamo royalty-free animation for incorporated game use; https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html. Do not redistribute standalone source FBX.'
$motions = @(
  @{ Source='fight-idle'; Id='fight-idle'; Query='Fighting+Idle'; Loop=$true },
  @{ Source='walk-forward'; Id='walk-forward'; Query='Unarmed+Walk+Forward'; Loop=$true },
  @{ Source='jab-cross'; Id='first-jab'; Query='Jab+Cross'; Start=1; End=18 },
  @{ Source='front-sweep'; Id='front-sweep'; Query='Sweep' }
)
New-Item -ItemType Directory -Force '.dream-loop' | Out-Null
foreach ($variant in @('ion', 'cinder')) {
  foreach ($motion in $motions) {
    if ($AttacksOnly -and $motion.Loop) { continue }
    $clip = "$variant-$($motion.Id)"
    $arguments = @('--background', '--python-exit-code', '1', '--python',
      'scripts/blender/import_forge_motion.py', '--', '--input',
      "assets/animations/mixamo/$($motion.Source).fbx", '--variant', $variant,
      '--name', $clip, '--source-url', "https://www.mixamo.com/#/?limit=96&page=1&query=$($motion.Query)",
      '--license-note', $license)
    if ($motion.ContainsKey('Start')) { $arguments += @('--start', $motion.Start, '--end', $motion.End) }
    & $blenderBinary @arguments *> ".dream-loop/$clip-import.log"
    if ($LASTEXITCODE -ne 0) { throw "Import failed: $clip. See .dream-loop/$clip-import.log" }
    Write-Output "Imported $clip"
  }
}
