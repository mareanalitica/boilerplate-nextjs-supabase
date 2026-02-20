# Docker Setup

## Arquivos Criados

- **Dockerfile**: Configuração multi-stage otimizada para produção
- **docker-compose.yml**: Orquestração do ambiente
- **.dockerignore**: Arquivos a excluir da imagem Docker

## Desenvolvimento Local

### Build da imagem
```bash
docker build -t mare-saas:latest .
```

### Usando docker-compose (recomendado)
```bash
docker-compose up -d
```

A aplicação estará disponível em `http://localhost:3000`

### Parar o container
```bash
docker-compose down
```

## Deploy em VPS com Colify

### 1. Preparar a VPS

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configurar no Colify

1. **Conectar repositório** ao Colify
2. **Criar nova aplicação** com base Docker
3. **Adicionar variáveis de ambiente** (vindo do `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NODE_ENV=production`

4. **Build e Deploy automático**:
   - Colify detectará automaticamente o Dockerfile
   - Cada push para `main` ou branch configurada faz deploy

### 3. Configuração Manual na VPS (alternativa)

Se preferir fazer deployment manual:

```bash
# Clonar repositório
git clone <seu-repo> /home/app/mare-saas
cd /home/app/mare-saas

# Criar arquivo .env com as variáveis
nano .env

# Deploy
docker-compose up -d
```

## Especificações da Imagem

- **Base**: Node.js 20 Alpine (leve e seguro)
- **Multi-stage build**: Reduz tamanho da imagem final
- **Non-root user**: Segurança (usuário nodejs)
- **Health check**: Monitoramento automático
- **Restart policy**: Auto-reinicia em caso de falha
- **Standalone output**: Otimizado para Next.js 15

## Performance

A imagem final é ~300MB (comprimida ~100MB), adequada para VPS com recursos limitados.

### Otimizações aplicadas:
- Alpine Linux (base mínima)
- npm ci (instalação determinística)
- Cópia seletiva de arquivos
- dumb-init para sinais SIGTERM/SIGKILL

## Troubleshooting

### Porta já em uso
```bash
docker-compose down
# ou mudar a porta em docker-compose.yml
```

### Verificar logs
```bash
docker-compose logs -f app
```

### Health check falhando
Verifique se a aplicação está rodando corretamente:
```bash
docker exec <container-id> curl http://localhost:3000
```
