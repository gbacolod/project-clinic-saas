import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common";
import { CreateQueueEntryDto } from "./dto/create-queue-entry.dto";
import { QueueQueryDto } from "./dto/queue-query.dto";
import { UpdateQueueEntryDto } from "./dto/update-queue-entry.dto";
import { QueueService } from "./queue.service";

@Controller("queue")
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  create(@Body() dto: CreateQueueEntryDto) {
    return this.queueService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueueQueryDto) {
    return this.queueService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.queueService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateQueueEntryDto) {
    return this.queueService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.queueService.remove(id);
  }
}
