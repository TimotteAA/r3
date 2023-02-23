import { OmitType } from "@nestjs/swagger";

import { CustomDtoValidation } from "@/modules/database/decorators";
import { ListQueryDto } from "@/modules/restful/dto";

@CustomDtoValidation({type: "query"})
export class ApiQueryCategoryDto extends OmitType(ListQueryDto, ['trashed']) {}