import { Controller, Sse, Post, Body } from "@nestjs/common";
import { Configuration, OpenAIApi } from "openai";

// import { EventsService } from "../services";
import { EditImageDto } from "../dtos/openai.dto";
import { Depends } from "@/modules/restful/decorators";
import { ContentModule } from "../content.module";
import { GUEST } from "@/modules/user/decorators";
import { env } from "@/modules/utils";

@Depends(ContentModule)
@Controller("ai")
export class OpenAiController {
    constructor() {
    }

    @Sse('result')
    async openApi() {

    }

    @GUEST()
    @Post("image")
    async image(@Body() data: EditImageDto) {
        const apiKey = env("OPENAI_KEY")
        let res: any
        try {
            const configuration = new Configuration({
                apiKey: apiKey
            });
            const openai = new OpenAIApi(configuration);
            const { text, n, size, format } = data;
            res = await openai.createImage({
                prompt: text,
                n,
                size,
                response_format: format
            });
        } catch (err) {
            // console.log("err", err);
        }
        return res.data;
    }
}