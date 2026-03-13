# MCP Hostinger — Configuração

## 1. Instalar o pacote globalmente

```bash
npm install -g hostinger-api-mcp
```

Após instalar, verifique o caminho do executável e do `server.js`:

```bash
# Windows
where hostinger-api-mcp
# Resultado esperado: C:\Program Files\nodejs\hostinger-api-mcp.cmd
# O server.js fica em: C:\Program Files\nodejs\node_modules\hostinger-api-mcp\server.js
```

---

## 2. Gerar o token da API Hostinger

Acesse o painel da Hostinger → **API Tokens** → gere um token com as permissões necessárias.

---

## 3. Localizar o arquivo de configuração correto

> **ATENÇÃO:** No Windows, o Claude Desktop usa um caminho diferente do documentado oficialmente.

| Sistema | Caminho correto |
|---------|----------------|
| **Windows (Claude Desktop Store)** | `C:\Users\<usuario>\AppData\Local\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json` |
| **Windows (instalação clássica)** | `%APPDATA%\Claude\claude_desktop_config.json` |
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |

Se você instalou o Claude Desktop pela **Microsoft Store**, use o caminho da primeira linha.

---

## 4. Editar o arquivo de configuração

Abra o arquivo correto e adicione dentro de `"mcpServers"`:

```json
{
  "mcpServers": {
    "hostinger-api": {
      "command": "node",
      "args": ["C:\\Program Files\\nodejs\\node_modules\\hostinger-api-mcp\\server.js"],
      "env": {
        "DEBUG": "false",
        "API_TOKEN": "SEU_TOKEN_AQUI"
      }
    }
  }
}
```

> **Por que usar `node server.js` diretamente?**
> Usar `"command": "hostinger-api-mcp"` ou `npx` pode falhar porque o Claude Desktop usa o `npx` do NVM, que baixa uma versão do pacote que crasha na inicialização. Apontar diretamente para o `server.js` instalado globalmente é mais confiável.

---

## 5. Reiniciar o Claude Desktop

Feche completamente e reabra o Claude Desktop. O MCP deve carregar **119 tools** da API Hostinger.

---

## Verificação

No Claude Desktop, pergunte: *"Liste meus sites na Hostinger"* — se responder com dados reais, está funcionando.

---

## Troubleshooting

**Servidor desconecta logo após iniciar (~2-7s):**
- Verifique se está editando o arquivo correto (Store vs instalação clássica).
- Teste o servidor manualmente no terminal:
  ```bash
  echo '{"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}},"jsonrpc":"2.0","id":0}' | API_TOKEN="SEU_TOKEN" node "C:\Program Files\nodejs\node_modules\hostinger-api-mcp\server.js"
  ```
  Se retornar `"Initialized 119 tools"`, o pacote está ok e o problema é no config.

**Logs do Claude Desktop:**
Menu `≡` → Help → Open MCP Log File
