param (
    [string]$Text = "Olá Guilherme! O Jarvis está operacional."
)

$speak = New-Object -ComObject SAPI.SpVoice
foreach ($voice in $speak.GetVoices()) {
    if ($voice.GetDescription() -like "*Portuguese*" -or $voice.GetDescription() -like "*Maria*") {
        $speak.Voice = $voice
        break
    }
}
$speak.Speak($Text)
