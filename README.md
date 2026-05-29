# baiq

Monorepo para paquetes npm publicos bajo el scope `@baiq/*`.

Actualmente contiene:

- `@baiq/activities`

El paquete raiz del repositorio tiene `"private": true`, por lo que no se publica en npm. Los paquetes dentro de `packages/*` se publican individualmente como paquetes npm publicos.

## Instalacion

```bash
npm install
```

## Compilacion

```bash
npm run build
```

## Tests

```bash
npm run test
```

## Publicacion

Para publicar `@baiq/activities` como paquete publico:

```bash
npm publish -w @baiq/activities --access public
```

Cada paquete publicable debe declarar:

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```
