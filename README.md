# GearHub Web

Frontend do GearHub, comunidade de reviews de hardware e periféricos, em Nuxt 4, Vue 3, Tailwind e GSAP.

A API fica em outro repositório: [GearHub-API](https://github.com/pedrobaraldi/GearHub-API).

## Rodar localmente

Com a API rodando em `http://localhost:8080`:

```bash
npm install
npm run dev
```

O site abre em `http://localhost:3000`.

## Configuração

Copie `.env.example` para `.env`. `NUXT_API_URL` define o endereço da API; sem ele, o site usa `http://localhost:8080`.

O Nuxt repassa `/api/**` e `/uploads/**` para a API. Assim, o navegador fala só com o domínio do site, sem CORS, e o cookie de sessão também funciona na renderização no servidor.

## Estrutura

- `app/pages`: telas do site.
- `app/components`: componentes, incluindo os formulários de post e review.
- `app/composables`: sessão, feed, interações e dados.
- `app/assets/css/main.css`: tokens de cor dos temas claro e escuro.
