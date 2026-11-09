---
id: nest-swagger-every-route
title: Declare every route's response type for OpenAPI and regenerate committed specs or clients
impact: MEDIUM
impactDescription: "generated clients and frontend types drift from the API and break at runtime instead of at build"
roles: [implementer, reviewer]
tags: openapi, nestjs
---
Each controller has `@ApiTags`, each handler a typed response (`@ApiOkResponse({ type: InvoiceDto })`, `@ApiCreatedResponse`, error responses it can return) and a DTO-class return type, not an inline object or a Prisma model. The `@nestjs/swagger` CLI plugin in `nest-cli.json` picks up DTO properties without per-field `@ApiProperty`; if the project uses it, don't add redundant decorators. If the repo commits a generated spec or client, regenerate it in the same change.

**Incorrect:**

```ts
@Get(':id')
get(@Param('id') id: string) { return this.invoices.find(id) }
```

**Correct:**

```ts
@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  @ApiOkResponse({ type: InvoiceDto })
  @ApiNotFoundResponse()
  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: SessionUser): Promise<InvoiceDto> {
    return this.invoices.findForUser(user.id, id)
  }
}
```

Reference: https://docs.nestjs.com/openapi/cli-plugin
