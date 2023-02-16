import { OmitType } from "@nestjs/swagger";

import { CustomDtoValidation } from "@/modules/core/decorators";
import { ListQueryDto } from "@/modules/restful/dto";

@CustomDtoValidation({type: "query"})
export class ApiQueryCategoryDto extends OmitType(ListQueryDto, ['trashed']) {}