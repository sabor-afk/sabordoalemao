# Servidor HTTP local sem instalacoes. Escuta apenas no proprio computador.
# Compativel com Windows PowerShell 5.1 e PowerShell 7+.
$ErrorActionPreference = 'Stop'
$porta = 8765
$raiz = [System.IO.Path]::GetFullPath($PSScriptRoot)
$tcp = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Loopback), $porta
$tipos = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.webp' = 'image/webp'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
  '.xml'  = 'application/xml; charset=utf-8'
  '.txt'  = 'text/plain; charset=utf-8'
  '.pdf'  = 'application/pdf'
}
function Responder($stream, [int]$codigo, [string]$descricao, [string]$mime, [byte[]]$corpo, [bool]$semCorpo) {
  $cabecalho = "HTTP/1.1 $codigo $descricao`r`nContent-Type: $mime`r`nContent-Length: $($corpo.Length)`r`nCache-Control: no-store`r`nX-Content-Type-Options: nosniff`r`nConnection: close`r`n`r`n"
  $dadosCab = [System.Text.Encoding]::ASCII.GetBytes($cabecalho)
  $stream.Write($dadosCab, 0, $dadosCab.Length)
  if (-not $semCorpo -and $corpo.Length -gt 0) {
    $stream.Write($corpo, 0, $corpo.Length)
  }
}
try {
  $tcp.Start()
  $endereco = "http://127.0.0.1:$porta/"
  Write-Host ""
  Write-Host "Site disponivel em $endereco" -ForegroundColor Green
  Write-Host "Somente este computador pode acessar. CTRL+C para encerrar."
  Start-Process $endereco
  while ($true) {
    $cliente = $tcp.AcceptTcpClient()
    try {
      $cliente.ReceiveTimeout = 10000
      $cliente.SendTimeout = 15000
      $stream = $cliente.GetStream()
      $leitor = New-Object System.IO.StreamReader ($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $linha = $leitor.ReadLine()
      if ([string]::IsNullOrWhiteSpace($linha)) { continue }
      $partes = $linha -split ' '
      if ($partes.Length -lt 2) { continue }
      # Consome os headers recebidos para nao corromper a resposta.
      do {
        $cab = $leitor.ReadLine()
      } while ($null -ne $cab -and $cab.Length -gt 0)
      $metodo = $partes[0].ToUpperInvariant()
      if ($metodo -ne 'GET' -and $metodo -ne 'HEAD') {
        $erro = [System.Text.Encoding]::UTF8.GetBytes('Metodo nao permitido')
        Responder $stream 405 'Method Not Allowed' 'text/plain; charset=utf-8' $erro $false
        continue
      }
      $caminhoUrl = ($partes[1] -split '[?#]')[0]
      $decodificado = [System.Uri]::UnescapeDataString($caminhoUrl)
      $relativo = $decodificado.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
      if ([string]::IsNullOrEmpty($relativo)) { $relativo = 'index.html' }
      $arquivo = [System.IO.Path]::GetFullPath((Join-Path $raiz $relativo))
      $prefixo = $raiz.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
      if (-not $arquivo.StartsWith($prefixo, [System.StringComparison]::OrdinalIgnoreCase)) {
        $erro = [System.Text.Encoding]::UTF8.GetBytes('Acesso negado')
        Responder $stream 403 'Forbidden' 'text/plain; charset=utf-8' $erro ($metodo -eq 'HEAD')
        continue
      }
      # Evita servir os scripts de teste como arquivos publicos.
      if ($arquivo.EndsWith('.ps1', [System.StringComparison]::OrdinalIgnoreCase) -or $arquivo.EndsWith('.cmd', [System.StringComparison]::OrdinalIgnoreCase) -or $arquivo.EndsWith('.bat', [System.StringComparison]::OrdinalIgnoreCase)) {
        $erro = [System.Text.Encoding]::UTF8.GetBytes('Acesso negado')
        Responder $stream 403 'Forbidden' 'text/plain; charset=utf-8' $erro ($metodo -eq 'HEAD')
        continue
      }
      if (-not [System.IO.File]::Exists($arquivo)) {
        $erro = [System.Text.Encoding]::UTF8.GetBytes('Arquivo nao encontrado')
        Responder $stream 404 'Not Found' 'text/plain; charset=utf-8' $erro ($metodo -eq 'HEAD')
        continue
      }
      $ext = [System.IO.Path]::GetExtension($arquivo).ToLowerInvariant()
      $mime = if ($tipos.ContainsKey($ext)) { $tipos[$ext] } else { 'application/octet-stream' }
      $corpo = [System.IO.File]::ReadAllBytes($arquivo)
      Responder $stream 200 'OK' $mime $corpo ($metodo -eq 'HEAD')
    } catch {
      Write-Warning ("Erro ao atender solicitacao: " + $_.Exception.Message)
    } finally {
      if ($null -ne $cliente) { $cliente.Close() }
    }
  }
} finally {
  $tcp.Stop()
}
