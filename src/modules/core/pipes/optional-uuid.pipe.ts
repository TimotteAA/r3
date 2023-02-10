import { ArgumentMetadata, ParseUUIDPipe } from "@nestjs/common";

export class OptionalParseUUIDPipe extends ParseUUIDPipe {
  async transform(value?: string, metadata?: ArgumentMetadata): Promise<string> {
    if (value === undefined) return value;
    return super.transform(value, metadata)
  }
}