import { CustomDtoValidation } from "@/modules/core/decorators";
import { QueryCommentDto } from "./comment.dto";

@CustomDtoValidation({type: "query"})
export class ApiQueryCategoryDto extends QueryCommentDto {}