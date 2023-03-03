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
        console.log("data", data);
        const apiKey = env("OPENAI_KEY")
        let res: any
        try {
            const configuration = new Configuration({
                apiKey: apiKey
            });
            // const openai = new OpenAIApi(configuration);
            // const { text, n, size, format } = data;
            // // res = await openai.createImage({
            // //     prompt: text,
            // //     n,
            // //     size,
            // //     response_format: format
            // // });

            async function getAiResponse(topic: string) {
                const openai = new OpenAIApi(configuration);
                console.log("213124124512")
                const completion = await openai.createCompletion({
                  model: "text-davinci-003",
                  prompt: topic,
                  max_tokens: 1024,
                  n: 1,
                  stop: null,
                  temperature: 0.7
                });
                console.log(completion.data.choices[0].text);
              }
            await getAiResponse("test");
            
        } catch (err) {
            console.log("err", err);
        }
        console.log("res", res);
        return res.data;
    }
}